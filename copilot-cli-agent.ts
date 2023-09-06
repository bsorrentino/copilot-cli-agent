import { OpenAI } from 'langchain';
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools';
import { FunctionMessage } from 'langchain/schema'
import 'dotenv/config'
import z from 'zod'
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { intro, outro, text } from '@clack/prompts';
import 'zx/globals'

/**
 * Langchain tool
 * Exports a Dataverse solution from a remote environment. 
 * 
 * @param {Object} input - Input parameters.
 * @param {string} input.solution - The name of the remote solution to export.
 * 
 * @returns {string} Confirmation message that the export was executed.
 */
const exportSolutionTool = new DynamicStructuredTool({
  name: "export_solution",
  description: "export dataverse solution from remote environment to local file system",
  schema: z.object({
    solution: z.string().describe("the remote solution name")
  }),
  func: async ( input ) => {
    console.debug( "Export Solution:", input)
    // return "export executed! please revise prompt removing import command"
    return "export executed!"
  },
})

const importSolutionTool = new DynamicStructuredTool({
  name: "import_solution",
  description: "import a dataverse solution to remote environment",
  schema: z.object({
    path:         z.string()
                    .describe("the solution path"),
    environment:  z.string()
                    .describe("the target environment"),
    type:         z.enum( ["managed", "unmanaged", "both"] )
                    .describe( "the solution type" )
                    .optional()
                    .default("managed"),
  }),
  func: async ( input ) => {
    console.debug( "Import Solution:", input)
    // return "import executed! please revise prompt removing import command"
    return "import executed!"
  },
})

const systemCommandTool = new DynamicStructuredTool({
  name: "unknown_cmd",
  description: "all system commands",
  schema: z.object({
    cmd: z.string().describe("the provided command"),
  }),
  func: async ( input ) => {
    console.debug( "System Command:", input)
    // return "import executed! please revise prompt removing import command"
    return "quit"
  },
})

const main = async () => {
     
  const model = new ChatOpenAI({ 
      // modelName: "gpt-4",
      modelName: "gpt-3.5-turbo-0613",
      stop: ["end", "stop", "quit"],
      temperature: 0});
  
  const tools = [ exportSolutionTool, importSolutionTool, systemCommandTool ];
  
  const agent = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "openai-functions",
  });

  intro(`let begin our conversation`);
  
  const input = await text({
    message: 'Which commands would you like me to execute? ',
    placeholder: '',
    initialValue: '',
    validate(value) {
      
    },
  });

  //console.debug( input )

  $.verbose = false
  try {
    const result = await agent.call({ input });
    console.log(result.output);
  
  }
  catch( e:any ) {
    console.error( e.message )
  }

}

main();
