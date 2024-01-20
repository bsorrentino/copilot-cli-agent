import { fileURLToPath } from 'url';
import path from 'node:path'
import pc from 'picocolors'
import * as p from '@clack/prompts';
import { 
  CopilotCliAgentExecutor, 
  ExecutionContext, 
  LogType, 
  banner, 
  runCommand, 
  scanFolderAndImportPackage,
  CommandHistory,
} from '@bsorrentino/copilot-cli-core';

import { NewCommandsCommandTool } from './new-command-command.js';
import { textPrompt } from './prompt-text.js'

import { ReadLine } from 'node:readline'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
 
  // const _modules = await scanFolderAndImportPackage( path.join( __dirname, 'commands') );

  let commandsPath = process.env['COMMANDS_PATH'];
  if(!commandsPath ) {
    commandsPath = path.join(process.cwd(), 'commands')
    p.log.warning(`'COMMANDS_PATH' environment variable is not defined! the commands path is set to ${commandsPath} by default` )
  }
  const _modules = await scanFolderAndImportPackage( commandsPath );
  
  const progress = p.spinner();

  const execContext:ExecutionContext = {

    history: new CommandHistory(),
    verbose: false,

    log: (msg: string, type?: LogType): void => {
      switch(type) {
				case 'info':
					p.log.info(msg)
					break;
				case 'warn':
					p.log.warning(msg)
					break;
        case 'error':
          p.log.error(msg)
          break;
        default:
          p.log.message(msg)
			}
      
      // console.log(msg)
    },

    setProgress: (message: string): void => progress.message(message),
    
  }
  
  const executor = await CopilotCliAgentExecutor.create([ 
          new NewCommandsCommandTool(progress), 
          ..._modules
        ], execContext );

  const _banner = await banner( path.dirname(__dirname) );

  p.intro( pc.green(_banner));
  
  let historyUsed = false;

  do {

    const prompt = textPrompt({
      message: 'Which commands would you like me to execute? ',
      placeholder: 'input prompt',
      initialValue: '',
      validate(value) { 
        if( !historyUsed && value.length === 0 ) {
           return "Please input a command!"
        }
      },
    })
    prompt.on('cursor', key => {
      if( execContext.history.isEmpty ) {
        return 
      }

      switch(key) {
        case 'up':
          execContext.history.moveBack()
          if( execContext.history.current ) {
            prompt.value = execContext.history.current
            prompt.valueWithCursor = prompt.value     
            historyUsed = true      
          }
          break
        case 'down':
          if( !execContext.history.isLast ) {
            execContext.history.moveNext()
            prompt.value = execContext.history.current
            prompt.valueWithCursor = prompt.value  
            historyUsed = true     
          }
          else {
            historyUsed = false     
          }
          break
      }
      
    })
    prompt.on('submit', cmd => {
      
      if( cmd === undefined && historyUsed && execContext.history.current ) {

        const readline = (<any>prompt).rl as ReadLine // hack to update the prompt value
        readline.write( execContext.history.current )
        execContext.history.moveLast()
      }
      else {
        execContext.history.push( cmd )
      }

      
    })

    const input = await prompt.prompt();
  
    if( p.isCancel(input) ) {
      // return cancel( p.italic('goodbye! 👋'))
      return p.outro(pc.italic(pc.yellow('goodbye! 👋')))
      //process.exit(0)
    }
  
    
    try {
     
      progress.start();
      const inputMatch = /^\s*[#?]\s*(.+)/.exec(input)
      if( inputMatch ) {

        await executor.run( inputMatch[1] );

      }
      else {
        await runCommand( input, execContext )
      }
    
    }  
    finally {
      progress.stop();
    }
  
  }
  while( true );

}

main()
  .catch( e => p.log.error( e ) );
;
