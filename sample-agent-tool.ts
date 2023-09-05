import { OpenAI } from 'langchain';
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from 'langchain/dist/tools/dynamic';
import 'dotenv/config'

const CLITool = new DynamicTool({
  name: "CLI Executor",
  description:
    "class this to execute a cli command",
  func: async ( input ) => {
    console.debug( "input", input)
    return "executed!"
  },
})
const main = async () => {
     
  const model = new OpenAI({ temperature: 0});
  
  const tools = [ CLITool ];
  
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "zero-shot-react-description",
  });

  console.log("Loaded agent.");

  const input = `What is the value of foo?`;

  console.log(`Executing with input "${input}"...`);

  const result = await executor.call({ input });

  console.log(`Got output ${result.output}`);

}

main();
