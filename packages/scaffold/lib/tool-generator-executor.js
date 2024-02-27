import { createOpenAIFunctionsAgent } from "langchain/agents";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { RunnableLambda } from "@langchain/core/runnables";
import { END, StateGraph } from "@langchain/langgraph";
import { RegexParser } from "langchain/output_parsers";
import { inspect } from "node:util";
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
export async function initializeToolAgentExecutor(options, { name, path: outputPath }) {
    function isAgentFinish(x) {
        return (x && "returnValues" in x);
    }
    function isAgentAction(x) {
        return !isAgentFinish(x);
    }
    const parseContent = async (agentOutcome) => {
        const output = agentOutcome.returnValues.output;
        const regexp = new RegExp(/```typescript\s*(.+)\s*```/, "s");
        const parser = new RegexParser(regexp, ['code'], 'noContent');
        const res = await parser.parse(output);
        if (res.code === undefined) {
            throw new Error(`information not enough to generate a schema\n${output}`);
        }
        return res.code;
    };
    const agentState = {
        input: {
            value: null
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
        if (agentOutcome && isAgentFinish(agentOutcome)) {
            return "end";
        }
        return "continue";
    };
    const runAgent = async (data, config) => {
        const agentOutcome = await agentRunnable.invoke(data, config);
        console.debug("runAgent agentOutcome", inspect(agentOutcome, { depth: 5 }));
        return {
            agentOutcome,
        };
    };
    const saveFileTool = async (data, config) => {
        const { agentOutcome } = data;
        console.debug("executeTools agentOutcome", inspect(agentOutcome, { depth: 5 }));
        if (agentOutcome && isAgentFinish(agentOutcome)) {
            const fileName = path.extname(name) === '' ? name + '.mts' : name;
            const filePath = (path.basename(outputPath) !== fileName) ?
                path.join(outputPath, fileName) :
                outputPath;
            await fs.writeFile(filePath, await parseContent(agentOutcome));
        }
        return {
            agentOutcome,
        };
    };
    // Define a new graph
    const workflow = new StateGraph({
        channels: agentState
    });
    workflow.addNode("agent", new RunnableLambda({ func: runAgent }));
    workflow.addNode("save-file", new RunnableLambda({ func: saveFileTool }));
    workflow.setEntryPoint("agent");
    workflow.addEdge("agent", "save-file");
    workflow.addEdge("save-file", END);
    return workflow.compile();
}
