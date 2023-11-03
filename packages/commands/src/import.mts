import { CallbackManagerForToolRun } from "langchain/callbacks";
import { z } from "zod";
import { CommandTool, ExecutionContext } from "copilot-cli-core";


const ImportSchema = z.object({
    path:         z.string()
                    .describe("the solution path"),
    environment:  z.string()
                    .describe("the target environment"),
    type:         z.enum( ["managed", "unmanaged", "both"] )
                    .describe( "the solution type" )
                    .optional()
                    .default("managed"),
  })
  class ImportSolutionTool extends CommandTool<typeof ImportSchema> {
  
    name = "import_solution"
    description = "import a dataverse solution to remote environment"
    schema = ImportSchema
  
    constructor( execContext?: ExecutionContext ) {
      super(execContext)
    }

    async _call(arg: z.output<typeof ImportSchema>, runManager?: CallbackManagerForToolRun): Promise<string> {
      console.debug( "Import Solution:", arg)
      // return "import executed! please revise prompt removing import command"
      return "import executed!"
    }
  }

  const createTool = ( execContext?: ExecutionContext  ) => new ImportSolutionTool( execContext )

  export default createTool