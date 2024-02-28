import { ChatOpenAI } from "@langchain/openai";
import { StructuredTool } from '@langchain/core/tools';
import { ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'url';
import { initializeToolAgentExecutor } from "./tool-generator-executor.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
        const filePath = (path.basename(outputPath) !== fileName) ?
            path.join(outputPath, fileName) :
            outputPath;
        // const filePath = path.join(process.cwd(), 'packages', 'commands', arg.name)
        // console.debug("save file", arg, filePath )
        await fs.writeFile(filePath, content);
        return `file ${fileName} saved`;
    }
}
export const generateToolClass = async (args, config) => {
    const llm = new ChatOpenAI({
        // modelName: "gpt-4",
        modelName: "gpt-3.5-turbo-0613",
        // stop: ["end", "stop", "quit"],
        maxConcurrency: 1,
        maxRetries: 3,
        maxTokens: 600,
        temperature: 0
    });
    const systemPromptTemplate = await fs.readFile(path.join(__dirname, '..', 'prompt-generate-tool-ts.txt'), 'utf8');
    const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemPromptTemplate);
    const prompt = ChatPromptTemplate.fromMessages([
        await systemMessage.format(args),
        new MessagesPlaceholder('agent_scratchpad')
    ]);
    const tools = [new SaveFileTool()];
    const agent = await initializeToolAgentExecutor({ prompt, tools, llm }, args);
    return await agent.invoke({ input: '' }, config);
};
if (process.argv[2] === '__TEST__') {
    (async () => {
        await generateToolClass({
            name: "Test1",
            desc: "My Last test",
            schema: 'z.object({\n    name: z.string().describe("the name"),\n});',
            command: 'echo "hello command"',
            path: path.join(process.cwd(), 'packages', 'commands')
        });
    })();
}
