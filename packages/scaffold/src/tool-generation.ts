import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import {  initializeAgentExecutorWithOptions } from "langchain/agents";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SaveFileSchema = z.object({
    name: z.string().describe("file name in Camel case"),
    content: z.string().describe(" text file content"),
    outputPath: z.string().describe("file path").optional(),
  });
class SaveFileTool extends StructuredTool<typeof SaveFileSchema>  {
    name ="save_file"
    description = "save file on local file system at path"
    schema = SaveFileSchema;

    protected async _call(arg: z.output<typeof SaveFileSchema>): Promise<string> {
        
        const { name, content, outputPath = process.cwd() } = arg;

        const fileName = path.extname(name) === '' ? name + '.mts': name

        const filePath = ( path.basename(outputPath) !== fileName ) ?
            path.join(outputPath, fileName) : 
            outputPath
        // const filePath = path.join(process.cwd(), 'packages', 'commands', arg.name)
        
        // console.debug("save file", arg, filePath )

        await fs.writeFile( filePath, content )

        return `file ${fileName} saved`

    }
}

const promptGenerateToolTemplateWithCommand = async () => 
  await fs.readFile( path.join(__dirname, '..', 'prompt-generate-tool-ts.txt'), 'utf8' )

export const generateToolClass = async ( args:{
    name: string, 
    desc:string, 
    schema: string, 
    command:string, 
    path:string
  }) => {
    
    
    const model = new ChatOpenAI({
      // modelName: "gpt-4",
      modelName: "gpt-3.5-turbo-0613",
      // stop: ["end", "stop", "quit"],
      maxConcurrency: 1,
      maxRetries: 3,
      maxTokens: 600,
      temperature: 0
    });
    
    const tools = [ new SaveFileTool() ] ;
    
    const agent = await initializeAgentExecutorWithOptions( tools, model, {
      agentType: "openai-functions",
      verbose: false,
      handleParsingErrors: (e:any) => "there is an error!"
    });
    
    // We can construct an LLMChain from a PromptTemplate and an LLM.
    
    const template = PromptTemplate.fromTemplate(
      await promptGenerateToolTemplateWithCommand()
    );
    
    const prompt = await template.format(args)
    
    return await agent.run(prompt);

}

