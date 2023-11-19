import { BaseTracer, Run } from "langchain/callbacks";
import { ExecutionContext } from "./copilot-cli-agent.js";
/**
 * Class that extends BaseTracer to handle callbacks for Copilot CLI.
 *
 * @link https://github.com/langchain-ai/langchainjs/blob/74e586a/langchain/src/callbacks/handlers/console.ts#L33
 */
export declare class CopilotCliCallbackHandler extends BaseTracer {
    private excutionContext?;
    name: "copilot_cli_callback_handler";
    constructor(excutionContext?: ExecutionContext | undefined);
    /**
    * Method used to persist the run. In this case, it simply returns a
    * resolved promise as there's no persistence logic.
    * @param _run The run to persist.
    * @returns A resolved promise.
    */
    protected persistRun(run: Run): Promise<void>;
    onLLMEnd?(run: Run): void | Promise<void>;
}
