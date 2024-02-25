import { Tool } from "langchain/tools";
import { ExecutionContext, runCommand } from "./copilot-cli-agent.js";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";


/**
 * SystemCommandTool is a Tool subclass that allows executing arbitrary 
 * system commands. It takes a command string as input and executes it using 
 * Node's child_process.spawn functionality.
*/
export class SystemCommandTool extends Tool {
    name ="system_cmd"
    description = "all system commands"
    
    private execContext?: ExecutionContext;

    constructor( execContext?: ExecutionContext ) {
        super()
        this.execContext = execContext
    }

    protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {
      
          return new Promise((resolve, reject) => 
            runCommand( arg, this.execContext )
              .then( result => resolve(result) )
              .catch( error => reject(error) )
          )

        // const result = await runCommand( arg, this.execContext )
        // return `command executed: ${result}`

    }
  }
