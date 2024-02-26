import { createOpenAIFunctionsAgent } from "langchain/agents";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { RunnableLambda } from "@langchain/core/runnables";
import { END, StateGraph } from "@langchain/langgraph";
export async function initializeToolAgentExecutor(options) {
    const asAgentFinish = (x) => (x && "returnValues" in x) ? x : undefined;
    const asAgentAction = (x) => !asAgentFinish(x) ? x : undefined;
    const agentState = {
        input: {
            value: null
        },
        chatHistory: {
            value: null,
            default: () => []
        },
        steps: {
            value: (x, y) => x.concat(y),
            default: () => []
        },
        agentOutcome: {
            value: null
        }
    };
    const agentRunnable = await createOpenAIFunctionsAgent(options);
    const toolExecutor = new ToolExecutor({ tools: options.tools });
    // Define logic that will be used to determine which conditional edge to go down
    const shouldContinue = (data) => {
        const { agentOutcome } = data;
        // console.debug("shouldContinue agentOutcome", inspect(agentOutcome,{depth:5}) );
        if (asAgentFinish(agentOutcome)) {
            return "end";
        }
        return "continue";
    };
    const runAgent = async (data, config) => {
        const agentOutcome = await agentRunnable.invoke(data, config);
        // console.debug("runAgent agentOutcome", inspect(agentOutcome,{depth:5}));
        return {
            agentOutcome,
        };
    };
    const executeTools = async (data, config) => {
        const { agentOutcome } = data;
        // console.debug("executeTools agentOutcome", inspect(agentOutcome,{depth:5}));
        const action = asAgentAction(agentOutcome);
        if (!action) {
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
    });
    // We now add a normal edge from `tools` to `agent`.
    // This means that after `tools` is called, `agent` node is called next.
    // workflow.addEdge("action", "agent");
    // This interrupt workflow after saving result
    workflow.addConditionalEdges("action", () => "end", {
        continue: "agent",
        end: END
    });
    const app = workflow.compile();
    return app;
}
