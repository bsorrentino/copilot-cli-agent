import { StructuredTool } from "@langchain/core/tools";
import { CreateOpenAIFunctionsAgentParams, createOpenAIFunctionsAgent } from "langchain/agents";
import { BaseMessage } from "@langchain/core/messages";
import { AgentAction, AgentFinish, AgentStep } from "@langchain/core/agents";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import type { RunnableConfig } from "@langchain/core/runnables";
import { RunnableLambda } from "@langchain/core/runnables";
import { END, StateGraph } from "@langchain/langgraph";
import { Runnable } from "@langchain/core/runnables";
import { RegexParser } from "langchain/output_parsers";
import { inspect } from "node:util";
import * as path from 'node:path'
import * as fs from 'node:fs/promises'

interface AgentState {
    input: string;
    steps: Array<AgentStep>;
    agentOutcome?: AgentAction | AgentFinish;
}

export async function initializeToolAgentExecutor(options: CreateOpenAIFunctionsAgentParams, { name, path:outputPath }: {name:string, path:string} ): Promise<Runnable> {
    
    function isAgentFinish(x: AgentAction | AgentFinish  ): x is AgentFinish {
        return (x && "returnValues" in x)
    }
    function isAgentAction(x: AgentAction | AgentFinish  ): x is AgentAction {
        return !isAgentFinish(x)
    }

    const parseContent = async (agentOutcome: AgentFinish) => {

        const output = agentOutcome.returnValues.output;

        const regexp = new RegExp(/```typescript\s*(.+)\s*```/, "s");
        const parser = new RegexParser(regexp, ['code'], 'noContent');

        const res = await parser.parse(output);

        if (res.code === undefined) {
            throw new Error(`information not enough to generate a schema\n${output}`);
        }

        return res.code
    }
        
    const agentState = {
        input: {
            value: null
        },
        steps: {
            value: (x:AgentStep[], y:AgentStep[]) => x.concat(y),
            default: () => []
        },
        agentOutcome: {
            value: null
        }
    };

    const agentRunnable = await createOpenAIFunctionsAgent( options );

    const toolExecutor = new ToolExecutor({ tools: options.tools as StructuredTool[] });

    // Define logic that will be used to determine which conditional edge to go down
    const shouldContinue = (data: AgentState) => {
        const { agentOutcome } = data;

        // console.debug("shouldContinue agentOutcome", inspect(agentOutcome,{depth:5}) );

        if ( agentOutcome && isAgentFinish(agentOutcome) ) {
            return "end";
        }
        return "continue";
    };

    const runAgent = async (data: AgentState, config?: RunnableConfig): Promise<Pick<AgentState, 'agentOutcome'>> => {

        const agentOutcome = await agentRunnable.invoke(data, config);

        // console.debug("runAgent agentOutcome", inspect(agentOutcome,{depth:5}));

        return {
            agentOutcome,
        };
    };

    const saveFileTool = async (data: AgentState, config?: RunnableConfig) => {
        const { agentOutcome } = data;

        // console.debug("executeTools agentOutcome", inspect(agentOutcome,{depth:5}));

        if (agentOutcome && isAgentFinish(agentOutcome)) {
            
            const fileName = path.extname(name) === '' ? name + '.mts': name

            const filePath = ( path.basename(outputPath) !== fileName ) ?
                path.join(outputPath, fileName) : 
                outputPath

            await fs.writeFile( filePath, await parseContent( agentOutcome ) );
        }

        return {
            agentOutcome,
        };
    };

    // Define a new graph
    const workflow = new StateGraph({
        channels: agentState
    });

    workflow.addNode("agent-tool-generator", new RunnableLambda({ func: runAgent }));
    workflow.addNode("save-tool-file", new RunnableLambda({ func: saveFileTool }));

    workflow.setEntryPoint("agent-tool-generator");

    workflow.addEdge("agent-tool-generator", "save-tool-file");
    workflow.addEdge("save-tool-file", END);

    return workflow.compile();
}