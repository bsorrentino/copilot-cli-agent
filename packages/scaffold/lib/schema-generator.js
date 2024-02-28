import { ChatOpenAI } from "@langchain/openai";
import { schemaGeneratorAgentExecutor } from "./schema-generator-executor.js";
export async function generateSchema(config) {
    const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });
    const executor = await schemaGeneratorAgentExecutor({ llm });
    const { result } = await executor.invoke({}, config);
    return result;
}
if (process.argv[2] === '__TEST__') {
    (async () => {
        const result = await generateSchema();
        console.debug(result);
    })();
}
