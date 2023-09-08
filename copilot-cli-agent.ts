import { PromptTemplate } from 'langchain/prompts';
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { StructuredTool, Tool } from 'langchain/tools';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManagerForToolRun } from 'langchain/callbacks';
import os from 'node:os'
// import { FunctionMessage } from 'langchain/schema'
import 'dotenv/config'
import z from 'zod'
import { intro, outro, text } from '@clack/prompts';
// import 'zx/globals'
import { promisify} from 'node:util'
import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs'
import path from 'node:path'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);

const scanFolderAndImportPackage = async (folderPath: string) => {
    // Ensure the path is absolute
    if (!path.isAbsolute(folderPath)) {
      folderPath = path.join(__dirname, folderPath);
  }

  console.debug( 'scan folder', folderPath )

  // Check if directory exists
  const stats = await statAsync(folderPath);
  if (!stats.isDirectory()) {
      throw new Error('Provided path either does not exist or is not a directory.');
  }

  // Read directory
  const files = await readdirAsync(folderPath);

  // Filter only .js files and dynamically require them
  const modules = files
      .filter(file => path.extname(file) === '.js')
      .map(file => import(path.join(folderPath, file)));
  
  return Promise.all(modules);
}

export const runCommand = async ( cmd: string ) => 
  new Promise<number|null>( (resolve, reject) => {
    const child =  spawn(cmd, { shell:true}) 

    // Read stdout
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', data => console.log(data.toString()) );

    // Read stderr
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', data => console.log(data.toString()) );

    // Handle errors
    child.on('error', error => reject(error.message) );

    // Handle process exit
    child.on('close', code => resolve(code) );

  })

class SystemCommandTool extends Tool {
  name ="system_cmd"
  description = "all system commands"

  protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {
    console.debug( "System Command:", arg)

    const code =  await runCommand( arg )

    return `command executed: ${code ?? ''}`
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

  intro(`let begin our conversation`);
  
  const input = await text({
    message: 'Which commands would you like me to execute? ',
    placeholder: '',
    initialValue: '',
    validate(value) {
      
    },
  });

  const promptTemplate = PromptTemplate.fromTemplate(
    `considering to not elaborate any answer and respond always 'complete'
    assuming that we are on {platform} operative system: 
            
    {input}`
  );
  
  try {
    const prompt = await promptTemplate.format( { platform: os.platform(), input: input })
    const result = await agent.run( prompt );
    console.log(result);
  
  }
  catch( e:any ) {
    console.error( e )
  }

}

main();
