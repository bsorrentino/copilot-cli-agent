import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { PromptTemplate } from "langchain/prompts";
import {  initializeAgentExecutorWithOptions } from "langchain/agents";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";




const generateZodSchema = async() => { 

    const promptZodSchemaOneShotTemplate =`
    As my typescript ASSISTANT expert in Zod usage.
    you MUST create the typescript code for creating an object schema following the template below:
    
    // beging template
    const schema = z.object(
        // here the properties of the schema
    );
    // end template
    
    To do this you MUST start to interact to the USER following the process below
    
    1. ask for properties information
    2. generate the typescript code for the schema
    3. ask to the USER to confirm the generated code
    4. if USER doesn't confirm the generated code, ask for the properties information again otherwise return typescript code 
    `
    
    const chat = new ChatOpenAI({ modelName: "gpt-4", temperature: 0});
    const memory = new BufferMemory({ returnMessages: true, memoryKey: "history" })

    const prompt = ChatPromptTemplate.fromMessages([
    [ "system", promptZodSchemaOneShotTemplate], 
    new MessagesPlaceholder("history"),
    ["human", "{input}"]] )

    const chain = new LLMChain({
        llm: chat,
        prompt: prompt,
        memory: memory,
    });

  
    const createZodSchema = async() => {

        const res = await chain.call({  
            input: `properties: imagePath required, outputPath optional`
        });
        
        const parser = new StringOutputParser();
        
        const text = await parser.parse(res.text);
        console.log(text);
        
        const pres = /(const schema = z.object\({.+}\);)/gms.exec(text)
        
        const schema = pres ? pres[1] : null;
        
        console.log(schema ?? "not found");
    }  

    const updateZodSchema = async() => {

        const res = await chain.call({  
            input: "No, add new property grayLevel optional as enum with values  4, 8 or 16 with default value 16" 
        });

        const parser = new StringOutputParser();

        const text = await parser.parse(res.text);
        console.log(text);

        const pres = /(const schema = z.object\({.+}\);)/gms.exec(text)

        const schema = pres ? pres[1] : null;

        console.log(schema ?? "not found");
    }

}

const scaffold = async( args:{name: string, desc:string, schema: string} ) => {
    const promptGenerateToolTemplate =`
    As my typescript assistant 

    I need that you create a langchain command tool as a plugin for the copilot-cli-agent application.
    To do that you must fill the typescript template below with the variables:
    NAME = {name}
    DESC = {desc}
    SCHEMA = {schema}
    and then copy the code below into a file named <NAME>.ts.


    // beging template
    import {{ z }} from "zod";
    import {{ CommandTool }} from "copilot-cli-core";

    <SCHEMA>;

    class <NAME>Tool extends CommandTool<typeof <NAME>Schema> {{
        name = "snake case of <NAME>";
        description = "<DESC>";
        schema = schema;
        
        async _call(arg, runManager) {{
            console.debug("executing <NAME> with arg:", arg);
            return "<NAME> executed!";
        }}
    }}
    export default new <NAME>Tool();
    // end template
    `

    const SaveFileSchema = z.object({
      content: z.string().describe(" text file content"),
    });
    class SaveFileTool extends StructuredTool<typeof SaveFileSchema>  {
      name ="save_file"
      description = "save source file on local file system"
      schema = SaveFileSchema;
    
      protected async _call(arg: any, runManager?: any): Promise<string> {
        
        console.log("save file", arg )
        return "file saved"
    
          // const result = await runCommand( arg, this.execContext )
          // return `command executed: ${result}`
    
      }
    }
    
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
      promptGenerateToolTemplate
    );
    
    const prompt = await template.format(args)
    
    const res = await agent.run(prompt);
    
    console.log(res);
    
}