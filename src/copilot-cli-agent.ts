import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process';
import { readdir, stat, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'url';
import { PromptTemplate } from 'langchain';
import { StructuredTool, Tool } from 'langchain/tools';
import { z } from 'zod';
import { AgentExecutor, initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from 'langchain/chat_models/openai';

import { CallbackManagerForToolRun } from 'langchain/callbacks';

export abstract class CommandTool<T extends z.ZodObject<any, any, any, any>> extends StructuredTool<T> {
  
  protected execContext?: ExecutionContext;

  constructor( execContext?: ExecutionContext ) {
    super()
    this.execContext = execContext
  }
}

export interface Progress { 
  start( message: string ):void;
  stop():void;
}

type Color = 'black' |'red' | 'green' | 'yellow' | 'blue' |'magenta' | 'cyan' | 'white';

type LogOptions = { fg: Color }

export interface ExecutionContext {

  progress( ): Progress;

  log( message: string, options?: Partial<LogOptions> ): void;
}

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);
//
// [patorjk's ASCII Art Generator](http://patorjk.com/software/taag/#p=testall&f=PsY2&t=AI%20powered%20CLI%0A)
//
export const banner = await readFile( path.join( __dirname, 'banner.txt'), 'utf8'); 

export const scanFolderAndImportPackage = async (folderPath: string) => {
    // Ensure the path is absolute
    if (!path.isAbsolute(folderPath)) {
      folderPath = path.join(__dirname, folderPath);
  }

  console.debug( 'scan folder', folderPath )

  // Check if directory exists
  const stats = await stat(folderPath);
  if (!stats.isDirectory()) {
      throw new Error('Provided path either does not exist or is not a directory.');
  }

  // Read directory
  const files = await readdir(folderPath);

  // Filter only .js files and dynamically require them
  const modules = files
      .filter(file => path.extname(file) === '.js')
      .map(file => import(path.join(folderPath, file)));
  
  return Promise.all(modules);
}

/**
 * [expandTilde description]
 *
 * @param   {string}  filePath  [filePath description]
 *
 * @return  {[type]}            [return description]
 */
export const expandTilde = (filePath:string ) => 
  ( filePath && filePath[0] === '~') ?
    path.join(os.homedir(), filePath.slice(1)) : filePath
  
/**
 * [runCommand description]
 *
 * @param   {string}            cmd  [cmd description]
 * @param   {ExecutionContext}  ctx  [ctx description]
 *
 * @return  {[type]}                 [return description]
 */    
export const runCommand = async ( cmd: string, ctx?: ExecutionContext ) => 
  new Promise<string>( (resolve, reject) => {
    const s = ctx?.progress();
    s?.start("Executing")

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
      s?.stop()
      reject(error.message) 
    })

    // Handle process exit
    child.on('close', code => { 
      s?.stop()
      resolve(result) 
    });

  })

  class SystemCommandTool extends Tool {
    name ="system_cmd"
    description = "all system commands"
    
    private execContext?: ExecutionContext;

    constructor( execContext?: ExecutionContext ) {
        super()
        this.execContext = execContext
    }

    protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {
  
      console.debug( "System Command:", arg)
  
      const result = await runCommand( arg, this.execContext )
  
      return `command executed: ${result}`
    }
  }

  export class CopilotCliAgentExecutor {

    public static async create(execContext?: ExecutionContext): Promise<CopilotCliAgentExecutor> {
  
      const model = new ChatOpenAI({
        // modelName: "gpt-4",
        modelName: "gpt-3.5-turbo-0613",
        // stop: ["end", "stop", "quit"],
        maxConcurrency: 1,
        maxRetries: 3,
        maxTokens: 600,
        temperature: 0
      });
  
      const modules = await scanFolderAndImportPackage('commands');
  
      const loadedTools = modules
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
  