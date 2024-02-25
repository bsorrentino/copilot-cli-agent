import { LLMResult } from "langchain/schema";
import { ExecutionContext } from "./copilot-cli-agent.js";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
/**
 * Class that extends BaseTracer to handle callbacks for Copilot CLI.
 *
 * @link https://github.com/langchain-ai/langchainjs/blob/74e586a/langchain/src/callbacks/handlers/console.ts#L33
 */
export declare class CopilotCliCallbackHandler extends BaseCallbackHandler {
    private excutionContext?;
    name: "copilot_cli_callback_handler";
    constructor(excutionContext?: ExecutionContext | undefined);
    handleLLMEnd?(output: LLMResult, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined): void | Promise<void>;
}
