import { Tool } from "@langchain/core/tools";
import { main } from '@bsorrentino/copilot-cli-scaffold';
export class NewCommandsCommandTool extends Tool {
    progress;
    name = "new_custom_commands_cmd";
    description = "create a new custom command";
    constructor(progress) {
        super();
        this.progress = progress;
    }
    async _call(arg, runManager) {
        this.progress.stop();
        return await main();
    }
}
