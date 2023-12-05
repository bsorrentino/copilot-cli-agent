import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { StringOutputParser  } from "langchain/schema/output_parser";
import { RegexParser } from "langchain/output_parsers";


const promptZodSchemaOneShotTemplate =`
As my typescript ASSISTANT expert in Zod usage,
you MUST create the typescript code for creating a Zod object schema following the template below:

// beging template
const schema = z.object(
    // here the properties of the schema
);
// end template

and the costraints:

1. NOT use required()
2. Use nonempty() ONLY if prefix is .array()
3. The schema must include a describe() call for each property; if omitted, you must infer it from the property name. 
        example: 
        USER: file Name - ASSISTANT: fileName.string().describe("the file name")
        USER: file Name "path of file" - ASSISSTANT: fileName.string().describe("path of file")
4. NOT use schema after declaration

You MUST start to interact to the USER following the process below

1. ask for properties information
2. generate the typescript code for the schema with follow costraints. 
3. ask to the USER to confirm the generated code
4. if USER doesn't confirm the generated code, ask for the properties information again otherwise return typescript code 
`

export class ZodSchemaGenerator {

    #chat = new ChatOpenAI({ modelName: "gpt-4", temperature: 0});
    #memory = new BufferMemory({ returnMessages: true, memoryKey: "history" })
    #chain!:LLMChain<string,any>

    constructor( private verbose = false ) {

        const prompt = ChatPromptTemplate.fromMessages([
            [ "system", promptZodSchemaOneShotTemplate], 
            new MessagesPlaceholder("history"),
            ["human", "{input}"]] )
        
        this.#chain = new LLMChain({
                llm: this.#chat,
                prompt: prompt,
                memory: this.#memory,
            });
    }

    #parseSchemaOutput = async ( output: string ) => {


        const regexp = new RegExp(/```typescript\s*(?:import { z } from 'zod';)?\s*(.+)```/, "s" );
        const parser = new RegexParser( regexp, ['code'], 'noContent' );

        const res = await parser.parse( output );

        return res.code 

    }

    async create( input: string ) {

        this.#memory.clear()
        
        const res = await this.#chain.call({ input });
        
        const parser = new StringOutputParser();
        
        const text = await parser.parse(res.text);
        if( this.verbose ) console.debug(text);
        
        return await this.#parseSchemaOutput(res.text)

    }

    async update( input: string ) {

        const res = await this.#chain.call({  
            input: `No, ${input}`
        });

        return await this.#parseSchemaOutput(res.text)
    }
}

export const generateZodSchema = () => (new ZodSchemaGenerator())
