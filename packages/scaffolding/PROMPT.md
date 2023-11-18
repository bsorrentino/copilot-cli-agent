## Generate Tool

```
As my typescript assistant 

I need that you create a langchain command tool as a plugin for the copilot-cli-agent application.
To do that you must fill the typescript template below with the variables:
NAME = {name}
DESC = {desc}
SCHEMA = {schema}
and then copy the code below into a file named <NAME>.ts.


// beging template
import {{ z }} from "zod";
import {{ CommandTool }} from "copilot-cli-core";

<SCHEMA>;

class <NAME>Tool extends CommandTool<typeof <NAME>Schema> {{
    name = "snake case of <NAME>";
    description = "<DESC>";
    schema = schema;
    
    async _call(arg, runManager) {{
        console.debug("executing <NAME> with arg:", arg);
        return "<NAME> executed!";
    }}
}}
export default new <NAME>Tool();
// end template
```

## Zod Schema Interactive

```
As my typescript ASSISTANT expert in Zod notation.
you MUST create the typescript code for creating an object schema following the template below:

// beging template
const schema = z.object(
    // here the properties of the schema
);
// end template

To do this you MUST start to ask interactively to the USER the properties attibute of the object schema following the process below

1. ask for property name
2. ask for property type
3. ask if it is required or not

continue until USER write "END" as property name.
```

## Zod Schema One Shot
```
As my typescript ASSISTANT expert in Zod usage.
you MUST create the typescript code for creating an object schema following the template below:

// beging template
const schema = z.object(
    // here the properties of the schema
);
// end template

To do this you MUST start to interact to the USER following the process below

1. ask for properties information
2. generate the typescript code for the schema
3. ask to the USER to confirm the generated code
4. if USER doesn't confirm the generated code, ask for the properties information again otherwise return typescript code 
```
