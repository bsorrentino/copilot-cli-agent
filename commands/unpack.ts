import { CallbackManagerForToolRun } from "langchain/callbacks";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import path from 'node:path'

import { runCommand } from '../copilot-cli-agent.js'

const UnpackSchema = z.object({
    file: z.string().describe("the solution file name"),
    folder: z.string().describe("the target solution folder name"),
  });
export class UnpackSolutionTool extends StructuredTool<typeof UnpackSchema> {
  
    name = "unpack_solution"
    description = "unpack dataverse solution zip file to a folder"
    schema = UnpackSchema
    
    async _call(arg: z.output<typeof UnpackSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
      console.debug( "Unpack Solution:", arg)

      const { file, folder } = arg

      const solution = path.join( folder, path.basename(file, '.zip').replace( /_(\d+)_(\d+)_(\d+)(_\d+)?$/, '' ))
   
      // await runCommand`pac solution unpack --zipfile ${file} --folder ${solution} --packagetype ${ptype} --allowDelete`
      const code = await runCommand(`pac solution unpack --zipfile ${file} --folder ${solution} --allowDelete`)
      
      return `unpack executed! ${code}`
  
    }
  }

export default new UnpackSolutionTool()