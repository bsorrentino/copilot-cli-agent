import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
/**
 * Class that extends BaseTracer to handle callbacks for Copilot CLI.
 *
 * @link https://github.com/langchain-ai/langchainjs/blob/74e586a/langchain/src/callbacks/handlers/console.ts#L33
 */
export class CopilotCliCallbackHandler extends BaseCallbackHandler {
    excutionContext;
    name = "copilot_cli_callback_handler";
    constructor(excutionContext) {
        super();
        this.excutionContext = excutionContext;
    }
    handleLLMEnd(output, runId, parentRunId, tags) {
        if (this.excutionContext?.verbose) {
            this.excutionContext?.log(`onLLMEnd:\n${JSON.stringify(output)}`, 'info');
        }
    }
}
