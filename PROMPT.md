# AI PROMPTS

## Unpack Dataverse Solution
* unpack solution "solution_export.zip" from "/tmp" to WORKSPACES folder in home directory
* unpack solution "solution_export.zip" from "/tmp" to WORKSPACES folder in home directory and move zip in
Download folder in home directory

## Pack Dataverse Solution
* pack solution "solution" from WORKSPACES in home directory as unmanaged
* pack solution "solution" from WORKSPACES in home directory as unmanaged.  move solution zip to "/tmp" folder


## Command Creation support

As my typescript assistant 

I need that you create a langchain command tool as a plugin for the copilot-cli-agent application.
To do that you must follow exclusively the three steps outlined below :

1. ask to User for command name (NAME)
2. ask to User for command description (DESC)
3. fill the following template with given data:

// beging template
import { z } from "zod";
import { CommandTool } from "copilot-cli-core";
const <NAME>Schema = z.object({
});
class <NAME>Tool extends CommandTool<typeof <NAME>Schema> {
    name = "<NAME>";
    description = "<DESCRIPTION>";
    schema = <NAME>Schema;
    async _call(arg, runManager) {
        console.debug("executing <NAME> with arg:", arg);
        return "<NAME> executed!";
    }
}
export default new <NAME>Tool();
// End template

