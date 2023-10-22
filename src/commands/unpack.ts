import { CallbackManagerForToolRun } from "langchain/callbacks";
import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import path from 'node:path'

import { runCommand, expandTilde } from '../copilot-cli-agent.js'

/** 
 * Schema for the unpack tool arguments.
 * 
 * @typedef {Object} UnpackSchema
 * 
 * @property {string} file - The path to the ZIP file to unpack.
 * @property {string} folder - The path to unpack the contents to.
 */
const UnpackSchema = z.object({
  file: z.string().describe("the solution complete file path"),
  folder: z.string().describe("the target solution folder name").optional(), 
});

/**
 * Langchain Tool 
 * Unpacks a Dataverse solution ZIP file into a folder.
 * 
 * sample prompts:
 * - unpack solution "solution_export.zip" from "/tmp" to WORKSPACES folder in home directory
 * 
 * @extends {StructuredTool}
 */  
export class UnpackSolutionTool extends StructuredTool<typeof UnpackSchema> {
  
    name = "unpack_solution"
    description = "unpack dataverse solution zip file to a folder"
    schema = UnpackSchema
    
    /**
     * Unpacks dataverse solution ZIP file.
     *
     * @param {Object} arg - The tool arguments.
     * @param {string} arg.file - Path to the ZIP file. 
     * @param {string} arg.folder - Path to extract the contents to.
     * @returns {Promise<string>} A confirmation message.
     */
    async _call(arg: z.output<typeof UnpackSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
      console.debug( "Unpack Solution:", arg)

      const { file, folder = path.dirname(arg.file) } = arg

      
      const solution = path.join( folder, path.basename(file, '.zip').replace( /_(\d+)_(\d+)_(\d+)(_\d+)?$/, '' ))
   
      // await runCommand`pac solution unpack --zipfile ${file} --folder ${solution} --packagetype ${ptype} --allowDelete`
      const code = await runCommand(`pac solution unpack --zipfile "${expandTilde(file)}" --folder "${expandTilde(solution)}" --allowDelete`)
      
      return `unpack executed! ${solution}`
  
    }
  }

export default new UnpackSolutionTool()