import { Tool } from "langchain/tools";
import { CommandTool, ExecutionContext, runCommand } from "copilot-cli-core";
import { CallbackManagerForToolRun } from "langchain/callbacks";
import { main } from '@bsorrentino/copilot-cli-scaffold'

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
        return await main()

    }
  }
