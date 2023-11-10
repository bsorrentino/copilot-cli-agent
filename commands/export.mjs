import { z } from "zod";
import { CommandTool } from "copilot-cli-core";
const ExportSchema = z.object({
    solution: z.string().describe("the remote solution name")
});
class ExportSolutionTool extends CommandTool {
    name = "export_solution";
    description = "export dataverse solution from remote environment to local file system";
    schema = ExportSchema;
    async _call(arg, runManager) {
        console.debug("Export Solution:", arg.solution);
        // return "export executed! please revise prompt removing import command"
        return "export executed!";
    }
}
export default new ExportSolutionTool();
