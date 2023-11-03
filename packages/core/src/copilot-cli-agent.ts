import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process';
import { readdir, stat, readFile } from 'node:fs/promises'
import { StructuredTool, Tool } from 'langchain/tools';
import { z } from 'zod';
import { AgentExecutor, initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManagerForToolRun } from 'langchain/callbacks';
import { PromptTemplate } from 'langchain/prompts';

export interface Progress { 
  start( message: string ):void;
  stop():void;
}

type Color = 'black' |'red' | 'green' | 'yellow' | 'blue' |'magenta' | 'cyan' | 'white';

export type LogOptions = { fg: Color }

/**
 * Interface for execution context passed to command tools. 
 * Provides logging and progress tracking capabilities.
*/
export interface ExecutionContext  {

  progress( ): Progress;

  log( message: string, options?: Partial<LogOptions> ): void;
}

/**
 * Abstract base class for command tools. Extends StructuredTool and adds an optional ExecutionContext property.
 * 
 * Command tools represent CLI commands that can be executed. They define a schema for their inputs and implement the 
 * _call method to handle execution. The ExecutionContext allows them to access logging and other context services.
*/
export abstract class CommandTool<T extends z.ZodObject<any, any, any, any>> extends StructuredTool<T> {
  
  protected execContext?: ExecutionContext;

  constructor( execContext?: ExecutionContext ) {
    super()
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
  await readFile(path.join( dirname ?? '', 'banner.txt'), 'utf8');

/**
 * Recursively scans the provided folder path and dynamically imports all JavaScript modules found.
 * 
 * @param folderPath - The absolute path of the folder to scan.
 * @returns A Promise resolving to an array of all imported modules.
 */
export const scanFolderAndImportPackage = async (folderPath: string) => {
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
  
  return Promise.all(modules);
}

/**
 * Expands the tilde (~) character in a file path to the user's home directory.
 * 
 * @param filePath - The file path to expand.
 * @returns The expanded file path with the tilde replaced by the home directory.
 */
export const expandTilde = (filePath: string) =>
  ( filePath && filePath[0] === '~') ?
    path.join(os.homedir(), filePath.slice(1)) : filePath
  
/**
 * Runs a shell command and returns the output.
 * 
 * @param cmd - The command to run.
 * @param ctx - Optional execution context for logging output. 
 * @returns Promise resolving to the command output string.
 */
export const runCommand = async (cmd: string, ctx?: ExecutionContext) => {
  
  return new Promise<string>( (resolve, reject) => {
    
    const child =  spawn(cmd, { shell:true }) 

    let result = ""

    // Read stdout
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', data => {
      result = data.toString()
      ctx?.log( result, { fg: 'green'}) 
    });

    // Read stderr
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', data => {
      result = data.toString()
      ctx?.log( result, { fg: 'red'}) ;
    })

    // Handle errors
    child.on('error', error => {
      reject(error.message) 
    })

    // Handle process exit
    child.on('close', code => { 
      resolve(result) 
    });

  })
}
  class SystemCommandTool extends Tool {
    name ="system_cmd"
    description = "all system commands"
    
    private execContext?: ExecutionContext;

    constructor( execContext?: ExecutionContext ) {
        super()
        this.execContext = execContext
    }

    protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {
  
      // console.debug( "System Command:", arg)
      const progress =  this.execContext?.progress()

      progress?.start( `Running command: ${arg}` )
      
      const result = await runCommand( arg, this.execContext )

      progress?.stop()
      

      return `command executed: ${result}`
    }
  }

  export class CopilotCliAgentExecutor {

    public static async create( commandModules: any[], execContext?: ExecutionContext): Promise<CopilotCliAgentExecutor> {
  
      const model = new ChatOpenAI({
        // modelName: "gpt-4",
        modelName: "gpt-3.5-turbo-0613",
        // stop: ["end", "stop", "quit"],
        maxConcurrency: 1,
        maxRetries: 3,
        maxTokens: 600,
        temperature: 0
      });
  
      const loadedTools = commandModules
        .filter(m => typeof (m?.default.createTool) === 'function')
        .map(m => m?.default.createTool(execContext))
        .filter(m => m && m.name && m.description && m.schema)
  
      const tools = [
        new SystemCommandTool(execContext),
        ...loadedTools
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
      `You are my command line executor assistant. 
      Limit your response to the word 'completed' and assume that we are on {platform} operative system:
  
      {input}`
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
  