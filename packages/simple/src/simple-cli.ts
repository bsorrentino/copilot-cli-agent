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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
 
  // const _modules = await scanFolderAndImportPackage( path.join( __dirname, 'commands') );

  const commandPath = process.env['COMMANDS_PATH'];
  if(!commandPath ) {
    throw new Error("'COMMANDS_PATH' environment variable is not defined!");
  }
  const _modules = await scanFolderAndImportPackage( commandPath );
  
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
  
  do {

    const prompt = textPrompt({
      message: 'Which commands would you like me to execute? ',
      placeholder: 'input prompt',
      initialValue: '',
      validate(value) { 
        if( value.length === 0 ) {
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
          }
          break
        case 'down':
          if( !execContext.history.isLast ) {
            execContext.history.moveNext()
            prompt.value = execContext.history.current
            prompt.valueWithCursor = prompt.value  
          }

          break
      }
      
    })
    prompt.on('submit', cmd => {
      execContext.history.push( cmd )
      console.log( execContext.history.current )
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

main().catch( e => console.error( e ) );
;

/*
import { TextPrompt, isCancel } from '@clack/core';

const pp = new TextPrompt({
  render() {
    return `What's your name?\n${this.valueWithCursor}`;
  },
});

pp.on('cursor', (key, value) => {
  console.log('cursor', key, value )
})
const name = await pp.prompt();
if (isCancel(name)) {
  process.exit(0);
}
*/
