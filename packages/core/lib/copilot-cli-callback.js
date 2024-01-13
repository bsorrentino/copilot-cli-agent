import { BaseTracer } from "langchain/callbacks";
/**
 * Class that extends BaseTracer to handle callbacks for Copilot CLI.
 *
 * @link https://github.com/langchain-ai/langchainjs/blob/74e586a/langchain/src/callbacks/handlers/console.ts#L33
 */
export class CopilotCliCallbackHandler extends BaseTracer {
    excutionContext;
    name = "copilot_cli_callback_handler";
    constructor(excutionContext) {
        super();
        this.excutionContext = excutionContext;
    }
    /**
    * Method used to persist the run. In this case, it simply returns a
    * resolved promise as there's no persistence logic.
    * @param _run The run to persist.
    * @returns A resolved promise.
    */
    persistRun(run) {
        return Promise.resolve();
    }
    // onLLMStart?(run: Run): void | Promise<void> {
    //     this.excutionContext?.log( `onLLMStart:` )
    // }
    onLLMEnd(run) {
        if (this.excutionContext?.verbose) {
            this.excutionContext?.log(`onLLMEnd:\n${JSON.stringify(run.outputs)}`, 'info');
        }
    }
}
