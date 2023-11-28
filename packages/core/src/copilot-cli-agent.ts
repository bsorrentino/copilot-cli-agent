import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { spawn } from 'node:child_process';
import { readdir, stat, readFile } from 'node:fs/promises'
import { StructuredTool } from 'langchain/tools';
import { z } from 'zod';
import { AgentExecutor, initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { CopilotCliCallbackHandler } from './copilot-cli-callback.js';
import { SystemCommandTool } from './system-command.js';

export type LogAttr = 'red' | 'inverse' | 'dim'; ;

/**
 * Interface for execution context passed to command tools. 
 * Provides logging and progress tracking capabilities.
*/
export interface ExecutionContext {

  verbose: boolean;

  setProgress(message: string): void;

  log(message: string, attr?: LogAttr): void;
}

/**
 * Abstract base class for command tools. Extends StructuredTool and adds an optional ExecutionContext property.
 * 
 * Command tools represent CLI commands that can be executed. They define a schema for their inputs and implement the 
 * _call method to handle execution. The ExecutionContext allows them to access logging and other context services.
*/
export abstract class CommandTool<T extends z.ZodObject<any, any, any, any>> extends StructuredTool<T> {

  protected execContext?: ExecutionContext;

  setExecutionContext(execContext?: ExecutionContext) {
    this.execContext = execContext
  }
}

/**
 * Loads and returns the contents of the banner.txt file.
 * 
 * This function is used to display a banner when the CLI starts up.
 * It loads the banner text from the provided banner.txt file.
 * 
 * @param dirname - The directory containing the banner.txt file.
 * @returns A promise resolving to the banner text string.
 * @link [patorjk's ASCII Art Generator](http://patorjk.com/software/taag/#p=testall&f=PsY2&t=AI%20powered%20CLI%0A)
 */
export const banner = async (dirname?: string) =>
  await readFile(path.join(dirname ?? '', 'banner.txt'), 'utf8');

/**
 * Recursively scans the provided folder path and dynamically imports all JavaScript modules found.
 * 
 * @param folderPath - The absolute path of the folder to scan.
 * @returns A Promise resolving to an array of all imported modules.
 */
export const scanFolderAndImportPackage = async (folderPath: string): Promise<CommandTool<any>[]> => {
  // Ensure the path is absolute
  // if (!path.isAbsolute(folderPath)) {
  //   folderPath = path.join(__dirname, folderPath);
  // }

  // Check if directory exists
  const stats = await stat(folderPath);
  if (!stats.isDirectory()) {
    throw new Error('Provided path either does not exist or is not a directory.');
  }

  // Read directory
  const files = await readdir(folderPath);

  // Filter only .js files and dynamically require them
  const modules = files
    .filter(file => path.extname(file) === '.mjs')
    .map(file => import(path.join(folderPath, file)));

  const result = Promise.all(modules).then(_modules =>
    _modules
      .map(m => m?.default)
      .filter(m => m instanceof CommandTool)
  );

  return result;
}

/**
 * Expands the tilde (~) character in a file path to the user's home directory.
 * 
 * @param filePath - The file path to expand.
 * @returns The expanded file path with the tilde replaced by the home directory.
 */
export const expandTilde = (filePath: string) =>
  (filePath && filePath[0] === '~') ?
    path.join(os.homedir(), filePath.slice(1)) : filePath


export type RunCommandArg = { cmd: string, out?: string, err?: string }
/**
 * Runs a shell command and returns the output.
 * 
 * @param cmd - The command to run.
 * @param ctx - Optional execution context for logging output. 
 * @returns Promise resolving to the command output string.
 */
export const runCommand = async (arg: RunCommandArg | string, ctx?: ExecutionContext): Promise<string> => {

  let options: RunCommandArg

  if (typeof arg === 'string') {
    options = { cmd: arg };
  } else {
    options = arg
  }

  return new Promise<string>((resolve, reject) => {

    ctx?.setProgress(`Running command: ${options.cmd}`)

    const child = spawn(options.cmd, { stdio: ['inherit', 'pipe', 'pipe'], shell: true })

    let result = ''

    if (options.out) {
      const output = fs.createWriteStream(options.out);
      child.stdout.pipe(output);
      if( ctx?.verbose ) {
        ctx?.log( `${options.cmd} > ${options.out}`, 'inverse');
      }
      else {
        ctx?.log('')
      }
    }
    else {
      // Read stdout
      child.stdout.setEncoding('utf8')
      child.stdout.on('data', data => {
        result = data.toString();
        if( ctx?.verbose )  {
          ctx?.log( options.cmd, 'inverse')
        }
        else {
          ctx?.log('')
        }
        ctx?.log( result ) 
      
      });
    }

    if (options.err) {
      const output = fs.createWriteStream(options.err);
      child.stderr.pipe(output);
    }
    else {
      // Read stderr
      child.stderr.setEncoding('utf8')
      child.stderr.on('data', data => {
        result = data.toString()
        ctx?.log(result, 'red');
      })
    }

    // Handle errors
    child.on('error', error => {
      ctx?.log(options.cmd, 'red')
      reject(error.message)

    })

    // Handle process exit
    child.on('close', code => {
      resolve(result)
    })

  })
}

export class CopilotCliAgentExecutor {

  public static async create(commandModules: CommandTool<any>[], execContext?: ExecutionContext): Promise<CopilotCliAgentExecutor> {

    const model = new ChatOpenAI({
      // modelName: "gpt-4",
      modelName: "gpt-3.5-turbo-0613",
      // stop: ["end", "stop", "quit"],
      maxConcurrency: 1,
      maxRetries: 3,
      maxTokens: 600,
      temperature: 0,
      callbacks: [new CopilotCliCallbackHandler(execContext)]
    });

    commandModules.forEach( m => m.setExecutionContext(execContext));
    
    // .map(m => m?.default)
    // .filter(m => m instanceof CommandTool)
    // //.filter(m => m && m.name && m.description && m.schema)
    // .map(m => m.setExecutionContext(execContext))

    const tools = [
      new SystemCommandTool(execContext),
      ...commandModules
    ];

    const agent = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "openai-functions",
      verbose: false,
      handleParsingErrors: (e) => {

        execContext?.log(`HANDLE ERROR ${e}`);
        return "there is an error!"
      }
    });

    return new CopilotCliAgentExecutor(agent);
  }

  private agent: AgentExecutor;

  private mainPromptTemplate = PromptTemplate.fromTemplate(
    `You are my command line executor assistant, limit your response to the word 'completed' and assume that we are on {platform} operative system:
  
    Execute:  {input}
    ` 
  );

  private constructor(agent: AgentExecutor) {
    this.agent = agent;
  }

  public async run(input: string) {

    const prompt = await this.mainPromptTemplate.format({ platform: os.platform(), input: input })
    const result = await this.agent.run(prompt);
    return result;
  }


}
