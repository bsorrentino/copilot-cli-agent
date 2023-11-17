## Command Creation support

As my typescript assistant 

I need that you create a langchain command tool as a plugin for the copilot-cli-agent application.
To do that you must follow exclusively the three steps outlined below :

1. ask to User for command name (NAME)
2. ask to User for command description (DESC)
3. fill the following template with given data :

// beging template
import { z } from "zod";
import { CommandTool } from "copilot-cli-core";
const <NAME>Schema = z.object({
});
class <NAME>Tool extends CommandTool<typeof <NAME>Schema> {
    name = "snake case of <NAME>";
    description = "<DESCRIPTION>";
    schema = <NAME>Schema;
    async _call(arg, runManager) {
        console.debug("executing <NAME> with arg:", arg);
        return "<NAME> executed!";
    }
}
export default new <NAME>Tool();
// End template

## Command Schema Creation support

As my typescript ASSISTANT expert in Zod notation for creating an object schema

I need that you ask interactively to the USER the properties attibute of the object schema follwing the process below

1. ask for property name
2. ask for property type
3. ask if it is required or not

continue untile USER write as property name "END"

after that generate Zod object schema with information given by USER
