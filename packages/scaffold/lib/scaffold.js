import * as p from '@clack/prompts';
import pc from 'picocolors';
import * as path from "node:path";
import { generateToolClass } from "./tool-generator.js";
import { generateSchema } from './schema-generator.js';
export async function main() {
    const spinner = p.spinner();
    p.intro(pc.yellow(`Let generate new custom command 🎬`));
    const namePrompt = () => p.text({
        message: pc.green('command name'),
        placeholder: 'meaningful command name',
        initialValue: '',
        validate(value) {
            if (value.length === 0)
                return `Value is required!`;
        },
    });
    const descPrompt = () => p.text({
        message: pc.green('command description'),
        placeholder: 'meaningful command description helping AI reasoning',
        initialValue: '',
        validate(value) {
            if (value.length === 0)
                return `Value is required!`;
        },
    });
    const askForconfirmSchema = async (schema) => {
        if (!schema)
            return false;
        return await p.confirm({
            message: `${pc.underline('zod schema')}:
  
       ${pc.italic(schema)}
  
      ${pc.green('Do you confirm schema above?')}`,
        });
    };
    const commandPrompt = () => {
        p.note(`
      to describe the command use notation <arg name> to reference arguments in the schema.

      It isn't supported redirect output to file
      `, 'command hints');
        return p.text({
            message: pc.green('command to execute'),
            placeholder: 'shell command, use <arg> to reference arguments in the schema',
            initialValue: 'echo "hello command"',
            validate(value) {
                if (value.length === 0)
                    return `Value is required!`;
            },
        });
    };
    const group = await p.group({
        name: namePrompt,
        desc: descPrompt,
        command: commandPrompt
    }, {
        // On Cancel callback that wraps the group
        // So if the user cancels one of the prompts in the group this function will be called
        onCancel: ({ results }) => {
            p.cancel('Operation cancelled.');
            process.exit(0);
        },
    });
    //////////////////////////////////////////////////////////////////////
    // Schema Generator
    //////////////////////////////////////////////////////////////////////
    const schemaCode = await generateSchema();
    //////////////////////////////////////////////////////////////////////
    // Tool Generator
    //////////////////////////////////////////////////////////////////////
    spinner.start(pc.magenta('generating tool class'));
    try {
        const tool = await generateToolClass({
            ...group,
            schema: schemaCode,
            path: path.join(process.cwd(), '..', 'commands', 'src')
        });
    }
    catch (e) {
        console.error('generating tool class error', e);
        process.exit(-1);
    }
    finally {
        spinner.stop();
    }
    p.outro(pc.yellow(`Command ${group.name} generated! bye 👋`));
    return `Command ${group.name} generated!`;
}
