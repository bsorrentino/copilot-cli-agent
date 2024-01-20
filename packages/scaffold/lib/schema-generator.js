import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RegexParser } from "langchain/output_parsers";
import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const promptZodSchemaOneShotTemplate = async () => await fs.readFile(path.join(__dirname, '..', 'prompt-generate-zod-schema-ts.txt'), 'utf8');
export class ZodSchemaGenerator {
    verbose;
    #chat = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });
    #memory = new BufferMemory({ returnMessages: true, memoryKey: "history" });
    #_lazy_chain;
    constructor(verbose = false) {
        this.verbose = verbose;
    }
    #parseSchemaOutput = async (output) => {
        const regexp = new RegExp(/```typescript\s*(?:import { z } from 'zod';)?\s*(.+)```/, "s");
        const parser = new RegexParser(regexp, ['code'], 'noContent');
        const res = await parser.parse(output);
        if (res.code === undefined) {
            throw new Error(`information not enough to generate a schema\n${output}`);
        }
        return res.code;
    };
    get #chain() {
        if (this.#_lazy_chain)
            return Promise.resolve(this.#_lazy_chain);
        return promptZodSchemaOneShotTemplate().then(tpl => {
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", tpl],
                new MessagesPlaceholder("history"),
                ["human", "{input}"]
            ]);
            this.#_lazy_chain = new LLMChain({
                llm: this.#chat,
                prompt: prompt,
                memory: this.#memory,
            });
            return this.#_lazy_chain;
        });
    }
    async create(input) {
        const chain = await this.#chain;
        this.#memory.clear();
        const res = await chain.call({ input });
        const parser = new StringOutputParser();
        const text = await parser.parse(res.text);
        if (this.verbose)
            console.debug(text);
        return await this.#parseSchemaOutput(res.text);
    }
    async update(input) {
        const chain = await this.#chain;
        const res = await chain.call({
            input: `No, ${input}`
        });
        return await this.#parseSchemaOutput(res.text);
    }
}
export const generateZodSchema = (verbose = false) => (new ZodSchemaGenerator(verbose));
