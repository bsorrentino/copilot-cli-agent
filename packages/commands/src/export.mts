
import { z } from "zod";

import { CommandTool } from "@bsorrentino/copilot-cli-core";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";

const ExportSchema = z.object({
    solution: z.string().describe("the remote solution name")
  });
class ExportSolutionTool extends CommandTool<typeof ExportSchema> {

  name = "export_solution"
  description = "export dataverse solution from remote environment to local file system"
  schema = ExportSchema

  async _call(arg: z.output<typeof ExportSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
      console.debug( "Export Solution:", arg.solution)

      // return "export executed! please revise prompt removing import command"
      return "export executed!"

  }
}
  
export default new ExportSolutionTool()