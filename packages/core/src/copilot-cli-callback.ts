import { BaseTracer, Run } from "langchain/callbacks";
import { ExecutionContext } from "./copilot-cli-agent.js";

/**
 * Class that extends BaseTracer to handle callbacks for Copilot CLI.
 * 
 * @link https://github.com/langchain-ai/langchainjs/blob/74e586a/langchain/src/callbacks/handlers/console.ts#L33
 */
export class CopilotCliCallbackHandler extends BaseTracer {

    name = "copilot_cli_callback_handler" as const;

    constructor( private excutionContext?: ExecutionContext ) {
        super()
    }

    /**
    * Method used to persist the run. In this case, it simply returns a
    * resolved promise as there's no persistence logic.
    * @param _run The run to persist.
    * @returns A resolved promise.
    */
    protected persistRun(run: Run): Promise<void> {
        return Promise.resolve();
    }

    // onLLMStart?(run: Run): void | Promise<void> {
        
    //     this.excutionContext?.log( `onLLMStart:` )
    // }

    onLLMEnd?(run: Run): void | Promise<void> {

        this.excutionContext?.log( `^-onLLMEnd:\n^-^/${JSON.stringify(run.outputs)}^` )
    }

    // onToolStart?(run: Run): void | Promise<void> {
    //     this.excutionContext?.log( `onToolStart:\n${JSON.stringify(run.outputs)}` )
    // }

    // onAgentAction?(run: Run): void | Promise<void> {
    //     this.excutionContext?.log( `onAgentAction:\n${JSON.stringify(run.outputs)}` )
    // }

    // onChainStart?(run: Run): void | Promise<void> {
    //     this.excutionContext?.log( `onChainStart:\n${JSON.stringify(run.outputs)}` )
    // }

    // onChainEnd?(run: Run): void | Promise<void> {
    //     this.excutionContext?.log( `onChainEnd:\n${JSON.stringify(run.outputs)}` )
    // }

    // onText?(run: Run): void | Promise<void> {
    //     this.excutionContext?.log( `onText:\n${JSON.stringify(run.outputs)}` )
    // }
}