import { StructuredTool, Tool } from "@langchain/core/tools";
import { ExecutionContext } from "./copilot-cli-agent.js";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
export declare class ListCommandsCommandTool extends Tool {
    private commandModules;
    private execContext?;
    name: string;
    description: string;
    constructor(commandModules: StructuredTool[], execContext?: ExecutionContext | undefined);
    protected _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string>;
}
