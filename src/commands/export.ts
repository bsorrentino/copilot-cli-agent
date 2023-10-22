import { CallbackManagerForToolRun } from "langchain/callbacks";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";

import { runCommand } from '../copilot-cli-agent.js'

const ExportSchema = z.object({
    solution: z.string().describe("the remote solution name")
  });
class ExportSolutionTool extends StructuredTool<typeof ExportSchema> {

name = "export_solution"
description = "export dataverse solution from remote environment to local file system"
schema = ExportSchema

async _call(arg: z.output<typeof ExportSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
    console.debug( "Export Solution:", arg.solution)

    // return "export executed! please revise prompt removing import command"
    return "export executed!"

}
}
  