import { Tool } from "@langchain/core/tools";
import { runCommand } from "./copilot-cli-agent.js";
/**
 * SystemCommandTool is a Tool subclass that allows executing arbitrary
 * system commands. It takes a command string as input and executes it using
 * Node's child_process.spawn functionality.
*/
export class SystemCommandTool extends Tool {
    name = "system_cmd";
    description = "all system commands";
    execContext;
    constructor(execContext) {
        super();
        this.execContext = execContext;
    }
    async _call(arg, runManager) {
        return new Promise((resolve, reject) => runCommand(arg, this.execContext)
            .then(result => resolve(result))
            .catch(error => reject(error)));
        // const result = await runCommand( arg, this.execContext )
        // return `command executed: ${result}`
    }
}
