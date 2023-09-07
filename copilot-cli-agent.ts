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

import { spawn } from 'child_process';



const ExportSchema = z.object({
  solution: z.string().describe("the remote solution name")
});
class ExportSolutionTool extends StructuredTool<typeof ExportSchema> {

  name = "export_solution"
  description = "export dataverse solution from remote environment to local file system"
  schema = ExportSchema
  
  async _call(arg: z.output<typeof ExportSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
    console.debug( "Export Solution:", arg.solution)
    // return "export executed! please revise prompt removing import command"
    return "export executed!"

  }
}

const ImportSchema = z.object({
  path:         z.string()
                  .describe("the solution path"),
  environment:  z.string()
                  .describe("the target environment"),
  type:         z.enum( ["managed", "unmanaged", "both"] )
                  .describe( "the solution type" )
                  .optional()
                  .default("managed"),
})
class ImportSolutionTool extends StructuredTool<typeof ImportSchema> {

  name = "import_solution"
  description = "import a dataverse solution to remote environment"
  schema = ImportSchema

  async _call(arg: z.output<typeof ImportSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
    console.debug( "Import Solution:", arg)
    // return "import executed! please revise prompt removing import command"
    return "import executed!"
  }
}

class SystemCommandTool extends Tool {
  name ="system_cmd"
  description = "all system commands"

  protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {
    console.debug( "System Command:", arg)

    return new Promise<string>( (resolve, reject) => {
      const child =  spawn(arg, { shell:true}) 

      // Read stdout
      child.stdout.setEncoding('utf8')
      child.stdout.on('data', data => console.log(data.toString()) );

      // Read stderr
      child.stderr.setEncoding('utf8')
      child.stderr.on('data', data => console.log(data.toString()) );

      // Handle errors
      child.on('error', error => reject(error.message) );

      // Handle process exit
      child.on('close', code => resolve(`command executed: ${code}`));

    })
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
  
  const tools = [ 
    new SystemCommandTool(),
    new ExportSolutionTool(), 
    new ImportSolutionTool(), 
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
