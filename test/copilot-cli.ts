import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config'
import { DynamicTool } from "langchain/tools";
import { Client as Hub } from 'langchainhub'
import { initializeAgentExecutorWithOptions } from "langchain/agents";

// [Emulated multi-function calls within one request](https://community.openai.com/t/emulated-multi-function-calls-within-one-request/269582)
const main = async () => {

    const function_descriptions = [
        {
            name: "export_solution",
            description: "export dataverse solution from remote environment to local file system",
            parameters: {
                type: "object",
                properties: {
                    solution: {
                        type: "string",
                        description: "the remote solution name",
                    }
                },
                required: ["solution"],
            },
        },
        {
            name: "import_solution",
            description: "import a dataverse solution to remote environment",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "the solution path",
                    },
                    environment: {
                        type: "string",
                        description: "the target environment",
                    },
                    type: {
                        type: "string",
                        description: "the solution type",
                        enum: ["managed", "unmanaged", "both"]
                    },
                },
                required: ["path", "environment"],
            },
        }
    ];

    const CLITool = new DynamicTool({
        name: "CLI Executor",
        description:
            "execute a function as cli command",
        func: async (input) => {
            console.debug("input", input)
            return "tool executed!"
        },
    })

    const model = new ChatOpenAI({
        // modelName: "gpt-4",
        modelName: "gpt-3.5-turbo-0613",
    })
    .bind({
        functions: function_descriptions,

    });
  
    let result = await model.invoke(
        `import the solution 'mysolution.zip' from path '/tmp' in environment 'bartolo' as unmanaged`
    );
    console.log(result.additional_kwargs.function_call);

    result = await model.invoke(
        "export solution 'test' and import it from path '/tmp' in environment 'bartolo' as unmanaged"
    );
    console.log(result.additional_kwargs.function_call);
    
    result = await model.invoke(
        "what's the powerapps cli commands to export solution 'test' and import it from path '/tmp' in environment 'bartolo' as unmanaged"
    );
    console.log(result.additional_kwargs.function_call);

    result = await model.invoke(
        "what are the powerapps cli commands"
    );
    console.log(result.additional_kwargs.function_call);
    console.log(result.lc_kwargs.content);



}

const langchainHubMain = async () => {
    const hub = new Hub()

    const repos = await hub.listRepos()

    console.log( repos )
}

// langchainHubMain()
main();
