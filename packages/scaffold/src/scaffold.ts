

import * as p from '@clack/prompts';
import pc from 'picocolors'

import { ZodSchemaGenerator, generateZodSchema } from "./schema-generator.js";
import { generateToolClass } from "./tool-generation.js";
import * as path from "node:path";

export async function main() {

  const spinner = p.spinner();

  p.intro( pc.yellow(`Let generate new custom command 🎬` ));

  const namePrompt = () => 
    p.text({
      message: pc.green('command name'),
      placeholder: 'meaningful command name',
      initialValue: '',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

  const descPrompt = () => 
    p.text({
      message: pc.green('command description'),
      placeholder: 'meaningful command description helping AI reasoning',
      initialValue: '',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

  const schemaDescPrompt = () => 
  p.text({
    message: pc.green('schema description'),
    placeholder: 'meaningful description of command schema',
    initialValue: 'properties: ',
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  const commandPrompt = () => {
    
    p.note( 
      `
      to describe the command use notation <arg name> to reference arguments in the schema.

      It isn't supported redirect output to file
      `, 
      'command hints')
    return p.text({
      message: pc.green('command to execute'),
      placeholder: 'shell command, use <arg> to reference arguments in the schema',
      initialValue: 'echo "hello command"',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

  }
  
  const group = await p.group(
    {
      name: namePrompt,
      desc: descPrompt,
      schema: schemaDescPrompt,
      command: commandPrompt
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
  
  // console.debug(group.name, group.desc );

  let schemaCode:string|null  = null;

  let schemaGenerator:ZodSchemaGenerator

  spinner.start( pc.magenta('generating schema') );

  try {
    schemaGenerator = generateZodSchema()

    schemaCode  = await schemaGenerator.create( group.schema );
    if( !schemaCode ) {
      throw `problem generating a schema!`
    }
  }
  catch( e ) {
    console.error( 'schema generation error', e );
    process.exit(-1)
  }
  finally {
    spinner.stop()
  }

  const askForconfirmSchema = async (code:string ) => 
    await p.confirm({
      message:
       `${pc.underline('zod schema')}:
  
       ${pc.italic(code)}
  
      ${pc.green('Do you confirm schema above?')}`,
    });
  
  let schemaConfirm: boolean | symbol = false;

  while( !(schemaConfirm = await askForconfirmSchema(schemaCode)) ) {

    const schemaDescUpdatePrompt = await p.text({
      message: pc.green('schema update'),
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

    spinner.start( pc.magenta('updating schema') );

    try {
      schemaCode  = await schemaGenerator.update( schemaDescUpdatePrompt );
      if( !schemaCode ) {
        console.warn( `problem generating a schema!`)
        process.exit(0)
      }  
    }
    catch( e ) {
      console.error( 'schema update error', e );
      process.exit(-1)
    }  
    finally {
      spinner.stop()
    }
  }

  if( p.isCancel(schemaConfirm) ) {
    p.cancel('Operation cancelled.');
    throw `Operation cancelled.`
  }

  spinner.start( pc.magenta('generating tool class') );
  try {

    const tool  = await generateToolClass( { 
      ...group, 
      schema: schemaCode, 
      path: path.join(process.cwd(), '..', 'commands', 'src' ) } );
  
  }
  catch( e ) {
    console.error( 'generating tool class error', e );
    process.exit(-1)
}
  finally {
    spinner.stop()
  }

  p.outro( pc.yellow(`Command ${group.name} generated! bye 👋` ));

  return `Command ${group.name} generated!`
}
