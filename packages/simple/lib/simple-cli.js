import { fileURLToPath } from 'url';
import path from 'node:path';
import pc from 'picocolors';
import * as p from '@clack/prompts';
import { CopilotCliAgentExecutor, banner, runCommand, scanFolderAndImportPackage, CommandHistory, } from '@bsorrentino/copilot-cli-core';
import { NewCommandsCommandTool } from './new-command-command.js';
import { textPrompt } from './prompt-text.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const main = async () => {
    // const _modules = await scanFolderAndImportPackage( path.join( __dirname, 'commands') );
    let commandsPath = process.env['COMMANDS_PATH'];
    if (!commandsPath) {
        commandsPath = path.join(process.cwd(), 'commands');
        p.log.warning(`'COMMANDS_PATH' environment variable is not defined!\nIt is set to '${commandsPath}' by default`);
    }
    const _modules = await scanFolderAndImportPackage(commandsPath);
    const progress = p.spinner();
    const execContext = {
        history: new CommandHistory(),
        verbose: false,
        log: (msg, type) => {
            switch (type) {
                case 'info':
                    p.log.info(msg);
                    break;
                case 'warn':
                    p.log.warning(msg);
                    break;
                case 'error':
                    p.log.error(msg);
                    break;
                default:
                    p.log.message(msg);
            }
            // console.log(msg)
        },
        setProgress: (message) => progress.message(message),
    };
    let executor;
    try {
        executor = await CopilotCliAgentExecutor.create([
            new NewCommandsCommandTool(progress),
            ..._modules
        ], execContext);
    }
    catch (e) {
        p.log.error(e.message);
        process.exit(-1);
    }
    const _banner = await banner(path.dirname(__dirname));
    p.intro(pc.green(_banner));
    let historyUsed = false;
    do {
        const prompt = textPrompt({
            message: 'Which commands would you like me to execute? ',
            placeholder: 'input prompt',
            initialValue: '',
            validate(value) {
                if (!historyUsed && value.trim().length === 0) {
                    return "Please input a command!";
                }
            },
        });
        prompt.on('cursor', key => {
            if (execContext.history.isEmpty) {
                return;
            }
            switch (key) {
                case 'up':
                    execContext.history.moveBack();
                    if (execContext.history.current) {
                        prompt.value = execContext.history.current;
                        prompt.valueWithCursor = prompt.value;
                        historyUsed = true;
                    }
                    break;
                case 'down':
                    if (!execContext.history.isLast) {
                        execContext.history.moveNext();
                        prompt.value = execContext.history.current;
                        prompt.valueWithCursor = prompt.value;
                        historyUsed = true;
                    }
                    else {
                        historyUsed = false;
                    }
                    break;
            }
        });
        prompt.on('submit', cmd => {
            if (historyUsed) {
                if (!cmd && execContext.history.current) {
                    const readline = prompt.rl; // hack to update the prompt value
                    readline.write(execContext.history.current);
                    execContext.history.moveLast();
                }
            }
            historyUsed = false;
            // for( const cmd of execContext.history ) {
            //   p.log.message(`[${cmd}]`)
            // }
        });
        const input = await prompt.prompt();
        if (p.isCancel(input)) {
            // return cancel( p.italic('goodbye! 👋'))
            return p.outro(pc.italic(pc.yellow('goodbye! 👋')));
            //process.exit(0)
        }
        try {
            progress.start();
            const inputMatch = /^\s*[#?]\s*(.+)/.exec(input);
            if (inputMatch) {
                await executor.run(inputMatch[1]);
            }
            else {
                await runCommand(input, execContext);
            }
        }
        finally {
            progress.stop();
        }
    } while (true);
};
main();
