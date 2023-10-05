import { PromptTemplate } from 'langchain/prompts';
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { StructuredTool, Tool } from 'langchain/tools';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManagerForToolRun } from 'langchain/callbacks';
import os from 'node:os'
// import { FunctionMessage } from 'langchain/schema'
import 'dotenv/config'
import z from 'zod'
import { intro, outro, text, cancel, isCancel, spinner } from '@clack/prompts';
// import 'zx/globals'
import { spawn } from 'node:child_process';
import { readdir, stat, readFile } from 'node:fs/promises'
import path from 'node:path'
import pc from 'picocolors'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


const scanFolderAndImportPackage = async (folderPath: string) => {
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


export const expandTilde = (filePath:string) => 
  ( filePath && filePath[0] === '~') ?
    path.join(os.homedir(), filePath.slice(1)) : filePath
  
export const runCommand = async ( cmd: string ) => 
  new Promise<string>( (resolve, reject) => {
    const s = spinner();
    s.start("Executing")

    const child =  spawn(cmd, { shell:true }) 

    let result = ""

    // Read stdout
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', data => {
      result = data.toString()
      console.log(pc.green(result)) 
    });

    // Read stderr
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', data => {
      result = data.toString()
      console.log(pc.red(result)) ;
    })

    // Handle errors
    child.on('error', error => {
      s.stop()
      reject(error.message) 
    })

    // Handle process exit
    child.on('close', code => { 
      s.stop()
      resolve(result) 
    });

  })


class SystemCommandTool extends Tool {
  name ="system_cmd"
  description = "all system commands"

  protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {

    console.debug( "System Command:", arg)

    const result = await runCommand( arg )

    return `command executed: ${result}`
  }
}

const main = async () => {
     
  const model = new ChatOpenAI({ 
      // modelName: "gpt-4",
      modelName: "gpt-3.5-turbo-0613",
      // stop: ["end", "stop", "quit"],
      maxConcurrency: 1,
      maxRetries: 3,
      maxTokens: 600,
      temperature: 0});
  
    const modules = await scanFolderAndImportPackage( 'commands');

    const loadedTools = modules
                        .map( m => m?.default )
                        .filter( m => m && m.name && m.description && m.schema )
    
    const tools = [ 
      new SystemCommandTool(),
      ...loadedTools
     ];
  
  const agent = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "openai-functions",
      verbose: false,
      handleParsingErrors: ( e ) => {

        console.error("HANDLE ERROR", e);
        return "there is an error!"
      }
  });

  const promptTemplate = PromptTemplate.fromTemplate(
    `You are my command line executor assistant. 
    Limit your response to the word 'completed' and assume that we are on {platform} operative system:

    {input}`
  );
  
  //
  // [patorjk's ASCII Art Generator](http://patorjk.com/software/taag/#p=testall&f=PsY2&t=AI%20powered%20CLI%0A)
  //
  const banner = await readFile( path.join( __dirname, 'banner.txt'), 'utf8'); 

  intro( pc.green(banner));
  
  do {

    const input = await text({
      message: 'Which commands would you like me to execute? ',
      placeholder: '',
      initialValue: '',
      validate(value) {
        
      },
    });
  
    if( isCancel(input) ) {
      // return cancel( p.italic('goodbye! 👋'))
      return outro(pc.italic(pc.yellow('goodbye! 👋')))
      //process.exit(0)
    }
  
    try {
      const prompt = await promptTemplate.format( { platform: os.platform(), input: input })
      const result = await agent.run( prompt );
      console.log(result);
    
    }
    catch( e:any ) {
      console.error( e )
    }
  
  }
  while( true );

}


main();
