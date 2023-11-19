import { Tool } from "langchain/tools";
import { ExecutionContext } from "./copilot-cli-agent.js";
import { CallbackManagerForToolRun } from "langchain/callbacks";
/**
 * SystemCommandTool is a Tool subclass that allows executing arbitrary
 * system commands. It takes a command string as input and executes it using
 * Node's child_process.spawn functionality.
*/
export declare class SystemCommandTool extends Tool {
    name: string;
    description: string;
    private execContext?;
    constructor(execContext?: ExecutionContext);
    protected _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string>;
}
