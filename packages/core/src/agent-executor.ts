import { StructuredTool } from "@langchain/core/tools";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CreateOpenAIFunctionsAgentParams, createOpenAIFunctionsAgent } from "langchain/agents";
import { BaseMessage } from "@langchain/core/messages";
import { AgentAction, AgentFinish, AgentStep } from "@langchain/core/agents";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import type { RunnableConfig } from "@langchain/core/runnables";
import { RunnableLambda } from "@langchain/core/runnables";
import { END, StateGraph } from "@langchain/langgraph";
import { Runnable } from "@langchain/core/runnables";

import os from 'node:os'
import { inspect } from 'node:util'

interface AgentState {
    input: string;
    chatHistory?: BaseMessage[];
    steps: Array<AgentStep>;
    agentOutcome?: AgentAction | AgentFinish;
}

const asAgentFinish = (x?: AgentAction | AgentFinish  ):AgentFinish|undefined => 
     (x && "returnValues" in x) ? x as AgentFinish : undefined;

const asAgentAction = (x?: AgentAction | AgentFinish  ):AgentAction|undefined => 
     !asAgentFinish(x) ? x as AgentAction : undefined;


export async function initializeCLIAgentExecutor(options: Pick<CreateOpenAIFunctionsAgentParams, "llm" | "tools">): Promise<Runnable<{input: string}>> {

    const agentState = {
        input: {
            value: null
        },
        chatHistory: {
            value: null,
            default: () => []
        },
        steps: {
            value: (x:any, y:any) => x.concat(y),
            default: () => []
        },
        agentOutcome: {
            value: null
        }
    };

    let prompt = await pull<ChatPromptTemplate>(
        "bsorrentino/copilot-cli-agent"
    )

    prompt = await prompt.partial({ platform: os.platform() });

    // Construct the OpenAI Functions agent
    const agentRunnable = await createOpenAIFunctionsAgent({
        prompt, ...options
    });


    const toolExecutor = new ToolExecutor({ tools: options.tools as StructuredTool[] });

    // Define logic that will be used to determine which conditional edge to go down
    const shouldContinue = (data: AgentState) => {
        const { agentOutcome } = data;

        // console.debug("shouldContinue agentOutcome", inspect(agentOutcome,{depth:5}) );

        if ( asAgentFinish(agentOutcome) ) {
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

    const executeTools = async (data: AgentState, config?: RunnableConfig): Promise<Pick<AgentState, 'steps'>> => {
        const { agentOutcome } = data;

        // console.debug("executeTools agentOutcome", inspect(agentOutcome,{depth:5}));

        const action = asAgentAction(agentOutcome);

        if (!action ) {
            throw new Error("Agent has not been run yet");
        }

        const output = await toolExecutor.invoke(agentOutcome, config);

        return {
            steps: [{ action, observation: output }]
        };
    };

    // Define a new graph
    const workflow = new StateGraph({
        channels: agentState
    });

    // Define the two nodes we will cycle between
    workflow.addNode("agent", new RunnableLambda({ func: runAgent }));
    workflow.addNode("action", new RunnableLambda({ func: executeTools }));

    // Set the entrypoint as `agent`
    // This means that this node is the first one called
    workflow.setEntryPoint("agent");

    // We now add a conditional edge
    workflow.addConditionalEdges(
        // First, we define the start node. We use `agent`.
        // This means these are the edges taken after the `agent` node is called.
        "agent",
        // Next, we pass in the function that will determine which node is called next.
        shouldContinue,
        // Finally we pass in a mapping.
        // The keys are strings, and the values are other nodes.
        // END is a special node marking that the graph should finish.
        // What will happen is we will call `should_continue`, and then the output of that
        // will be matched against the keys in this mapping.
        // Based on which one it matches, that node will then be called.
        {
            // If `tools`, then we call the tool node.
            continue: "action",
            // Otherwise we finish.
            end: END
        }
    );

    workflow.addConditionalEdges("action", () =>  "end",
     {
      continue: "agent",
      end: END
    });

    // We now add a normal edge from `tools` to `agent`.
    // This means that after `tools` is called, `agent` node is called next.
    // workflow.addEdge("action", "agent");

    return workflow.compile();
}