import { StructuredTool, Tool } from "@langchain/core/tools";
import {  ExecutionContext } from "./copilot-cli-agent.js";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";

export class ListCommandsCommandTool extends Tool {
    name ="list_custom_commands_cmd"
    description = "list custom commands"
    
    //private execContext?: ExecutionContext;

    constructor( private commandModules: StructuredTool[], private execContext?: ExecutionContext ) {
        super()
    }

    protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {
        
        return new Promise((resolve, reject) => {
            this.execContext?.log( '\n' )
            const result = this.commandModules.map( (m,i) => {
                const l = `${i}) ${m.name} - ${m.description}`
                this.execContext?.log( l )
                return l
                })
            resolve( result.join('\n') )
        });
      

            
    }
  }
