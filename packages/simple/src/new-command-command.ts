import { Tool } from "@langchain/core/tools";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { scaffhold } from '@bsorrentino/copilot-cli-scaffold'

type Progress = {
    start: (msg?: string) => void;
    stop: (msg?: string, code?: number) => void;
    message: (msg?: string) => void;
};

export class NewCommandsCommandTool extends Tool {
    name ="new_custom_commands_cmd"
    description = "create a new custom command"

    constructor( private progress:Progress) {
        super()
    }

    protected async _call(arg: any, runManager?: CallbackManagerForToolRun | undefined): Promise<string> {
        
        this.progress.stop()
        /**
        * Passes the callback manager's child callbacks to scaffhold.
        * This allows scaffhold to invoke the callbacks during execution as child of the parent callback manager.
        */
        return await scaffhold({ callbacks: runManager?.getChild() })
        
    }
  }
