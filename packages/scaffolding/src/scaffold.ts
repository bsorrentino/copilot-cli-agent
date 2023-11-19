

import * as p from '@clack/prompts';
import { generateZodSchema } from "./schema-generator.js";
import { generateToolClass } from "./tool-generation.js";

async function main() {

  p.intro( `copilot-cli-agent: new command scaffolding` );

  const namePrompt = () => 
    p.text({
      message: 'command name',
      placeholder: 'meaningful command name',
      initialValue: 'PlantUML Sprite Generator',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

  const descPrompt = () => 
    p.text({
      message: 'command description',
      placeholder: 'meaningful command description helping AI reasoning',
      initialValue: 'Generate a PlantUML sprite from a given image.',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

    const schemaDescPrompt = () => 
    p.text({
      message: 'schema description',
      placeholder: 'meaningful description of command schema',
      initialValue: 'properties: imagePath required, outputPath optional, grayLevel optional as enum with values 4, 8 or 16 with default value 16',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

  const group = await p.group(
    {
      name: namePrompt,
      desc: descPrompt,
      schema: schemaDescPrompt
    },
    {
      // On Cancel callback that wraps the group
      // So if the user cancels one of the prompts in the group this function will be called
      onCancel: ({ results }) => {
        p.cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  );
  
  console.log(group.name, group.desc );

  const schemaGenerator = generateZodSchema()

  let schemaCode  = await schemaGenerator.create( group.schema );
  if( !schemaCode ) {
    console.warn( `preoble generating a schema!`)
    process.exit(0)
  }

  const askForconfirmSchema = async (code:string ) => 
    await p.confirm({
      message:
       `zod schema:
  
  
       ${code}
  
      Do you confirm schema above?`,
    });
  
    let confirmSchema = await askForconfirmSchema(schemaCode)

    while( !confirmSchema ) {

    const schemaDescUpdatePrompt = await p.text({
      message: 'schema update',
      placeholder: 'describe updates to the schema',
      initialValue: '',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

    if( p.isCancel(schemaDescUpdatePrompt) ) {
        p.cancel('Operation cancelled.');
        process.exit(0);
    }

    schemaCode  = await schemaGenerator.update( schemaDescUpdatePrompt );
    if( !schemaCode ) {
      console.warn( `problem generating a schema!`)
      process.exit(0)
    }

    confirmSchema = await askForconfirmSchema(schemaCode)
  }

  const tool  = await generateToolClass( { ...group, schema: schemaCode } )

  p.outro( `copilot-cli-agent: end scaffolding` );
}



main();