import { CallbackManagerForToolRun } from "langchain/callbacks";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";

import { runCommand } from '../copilot-cli-agent.js'

const PackSchema = z.object({
    solution: z.string().describe("the local solution folder name")
  });
export class PackSolutionTool extends StructuredTool<typeof PackSchema> {
  
    name = "pack_solution"
    description = "pack dataverse solution folder to a zip file"
    schema = PackSchema
    
    async _call(arg: z.output<typeof PackSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
      console.debug( "Pack Solution:", arg.solution)

      await runCommand( `ls -la ${arg.solution}`)
      // return "export executed! please revise prompt removing import command"
      return "pack executed!"
  
    }
  }

export default new PackSolutionTool()