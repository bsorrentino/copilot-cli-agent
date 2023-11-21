import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
const SaveFileSchema = z.object({
    name: z.string().describe("file name in Camel case"),
    content: z.string().describe(" text file content"),
    outputPath: z.string().describe("file path").optional(),
});
class SaveFileTool extends StructuredTool {
    name = "save_file";
    description = "save file on local file system at path";
    schema = SaveFileSchema;
    async _call(arg) {
        const { name, content, outputPath = process.cwd() } = arg;
        const fileName = path.extname(name) === '' ? name + '.mts' : name;
        // const filePath = path.join(process.cwd(), 'packages', 'commands', arg.name)
        const filePath = path.join(outputPath, fileName);
        // console.debug("save file", arg, filePath )
        await fs.writeFile(filePath, content);
        return `file ${fileName} saved`;
    }
}
const promptGenerateToolTemplateWithCommand = `
  As my typescript assistant 

  I need that you create a langchain command tool as a plugin for the copilot-cli-agent application.
  To do that you must fill the typescript template below with the variables:
  NAME = {name}
  DESC = {desc}
  SCHEMA = {schema}
  COMMAND = {command}

  before filling the template consider to transform <COMMAND> in a string matching the schema attribute with command parameters.

  as example :
  ls -la <path> must be translated into "ls -la {{arg.path}}" 

  and finally save generated code into a file named "<NAME>.mts" at "{path}".

  
  // beging template
  import {{ z }} from "zod";
  import {{ CommandTool, expandTilde, runCommand }} from "copilot-cli-core";

  <SCHEMA>;

  class "Camel Case of <NAME>"Tool extends CommandTool<typeof schema> {{
      name = "Snake case of <NAME>";
      description = "<DESC>";
      schema = schema;
      
      async _call(arg: z.output<typeof schema>) {{

          const res = await runCommand( <command>, this.execContext )
          return this.name +  'completed ' + res;
      }}
  }}
  export default new "Camel case of <NAME>"Tool();
  // end template
  `;
export const generateToolClass = async (args) => {
    const model = new ChatOpenAI({
        // modelName: "gpt-4",
        modelName: "gpt-3.5-turbo-0613",
        // stop: ["end", "stop", "quit"],
        maxConcurrency: 1,
        maxRetries: 3,
        maxTokens: 600,
        temperature: 0
    });
    const tools = [new SaveFileTool()];
    const agent = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "openai-functions",
        verbose: false,
        handleParsingErrors: (e) => "there is an error!"
    });
    // We can construct an LLMChain from a PromptTemplate and an LLM.
    const template = PromptTemplate.fromTemplate(promptGenerateToolTemplateWithCommand);
    const prompt = await template.format(args);
    return await agent.run(prompt);
};
