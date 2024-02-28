import { RunnableLambda } from "@langchain/core/runnables";
import { END, StateGraph } from "@langchain/langgraph";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { SystemMessage } from "@langchain/core/messages";
import { RegexParser } from "langchain/output_parsers";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as p from '@clack/prompts';
import pc from 'picocolors';
import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function schemaGeneratorAgentExecutor({ llm }) {
    const spinner = p.spinner();
    const promptZodSchemaOneShotTemplate = async () => await fs.readFile(path.join(__dirname, '..', 'prompt-generate-zod-schema-ts.txt'), 'utf8');
    const outputParser = new StringOutputParser();
    const parseContent = async (message) => {
        const output = await outputParser.parse(message.content);
        const regexp = new RegExp(/```typescript\s*(?:import { z } from 'zod';)?\s*(.+)```/, "s");
        const parser = new RegexParser(regexp, ['code'], 'noContent');
        const res = await parser.parse(output);
        if (res.code === undefined) {
            throw new Error(`information not enough to generate a schema\n${output}`);
        }
        return res.code;
    };
    const askForconfirmSchema = async (schema) => {
        if (!schema)
            return false;
        return await p.confirm({
            message: `${pc.underline('zod schema')}:
      
           ${pc.italic(schema)}
      
          ${pc.green('Do you confirm schema above?')}`,
        });
    };
    const generatorState = {
        input: {
            value: null
        },
        messages: {
            value: (x, y) => x.concat(y),
            default: () => []
        },
        result: {
            value: null
        }
    };
    const tpl = await promptZodSchemaOneShotTemplate();
    const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage(tpl),
        new MessagesPlaceholder("messages"),
        ["human", "{input}"],
        // new HumanMessage( "{input}" ),
    ]);
    const runAskForInput = async (data) => {
        const { messages } = data;
        // console.debug('runAskForInput', messages);
        const input = await p.text({
            message: pc.green('schema description'),
            placeholder: 'meaningful description of command schema',
            initialValue: 'properties: ',
            validate: value => (value.length === 0) ? `Value is required!` : undefined,
        });
        if (p.isCancel(input)) {
            p.cancel('Operation cancelled.');
            process.exit(0);
        }
        return { input };
    };
    const runAgentGenerator = async (data, config) => {
        const { input, messages } = data;
        if (!input)
            throw new Error("input is undefined");
        // console.debug('runAgent.start', input, messages);
        spinner.start(pc.magenta(messages.length === 0 ? 'generating schema' : 'updating schema'));
        try {
            const message = await prompt.pipe(llm).invoke({ input, messages }, config);
            // console.debug('runAgent.end', message);
            const result = await parseContent(message);
            return {
                messages: [message],
                result
            };
        }
        finally {
            spinner.stop();
        }
    };
    const humanValidator = async (data) => {
        const { result } = data;
        if (result === undefined)
            throw new Error("the result is undefined");
        const confirm = await askForconfirmSchema(result);
        if (confirm)
            return { input: 'YES' };
        const schemaDescUpdatePrompt = await p.text({
            message: pc.green('schema update'),
            placeholder: 'describe updates to the schema',
            initialValue: '',
            validate: value => (value.length === 0) ? `Value is required!` : undefined,
        });
        if (p.isCancel(schemaDescUpdatePrompt)) {
            p.cancel('Operation cancelled.');
            process.exit(0);
        }
        return { input: `NO, ${schemaDescUpdatePrompt}` };
    };
    const shouldContinue = (data) => {
        const { input } = data;
        // console.debug('shouldContinue', input);
        if (input === "YES") {
            return "end";
        }
        return "continue";
    };
    // Define a new graph
    const workflow = new StateGraph({
        channels: generatorState
    });
    // Define the two nodes we will cycle between
    workflow.addNode("first-input", new RunnableLambda({ func: runAskForInput }));
    workflow.addNode("agent-generator", new RunnableLambda({ func: runAgentGenerator }));
    workflow.addNode("approver", new RunnableLambda({ func: humanValidator }));
    workflow.addEdge("first-input", "agent-generator");
    workflow.addEdge("agent-generator", "approver");
    // We now add a conditional edge
    workflow.addConditionalEdges(
    // First, we define the start node. We use `approver`.
    // This means these are the edges taken after the `approver` node is called.
    "approver", 
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
        continue: "agent-generator",
        // Otherwise we finish.
        end: END
    });
    // Set the entrypoint as `agent`
    // This means that this node is the first one called
    workflow.setEntryPoint("first-input");
    return workflow.compile();
}
