import { Tool } from "@langchain/core/tools";
export class ListCommandsCommandTool extends Tool {
    commandModules;
    execContext;
    name = "list_custom_commands_cmd";
    description = "list custom commands";
    //private execContext?: ExecutionContext;
    constructor(commandModules, execContext) {
        super();
        this.commandModules = commandModules;
        this.execContext = execContext;
    }
    async _call(arg, runManager) {
        return new Promise((resolve, reject) => {
            this.execContext?.log('\n');
            const result = this.commandModules.map((m, i) => {
                const l = `${i}) ${m.name} - ${m.description}`;
                this.execContext?.log(l);
                return l;
            });
            resolve(result.join('\n'));
        });
    }
}
