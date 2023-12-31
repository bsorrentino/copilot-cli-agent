import 'dotenv/config'
import { fileURLToPath } from 'url';
import path from 'node:path'
import pc from 'picocolors'
import * as p from '@clack/prompts';

import { 
  CopilotCliAgentExecutor, 
  ExecutionContext, 
  LogAttr, 
  banner, 
  runCommand, 
  scanFolderAndImportPackage
} from 'copilot-cli-core';
import { NewCommandsCommandTool } from './new-command-command.js';

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
    verbose: false,

    log: (msg: string, attr?: LogAttr): void => {
      switch(attr) {
				case 'red':
					msg = pc.red(msg);
					break;
				case 'inverse':
					msg = pc.inverse(msg);
					break;
        case 'dim':
          msg = pc.dim(msg);
          break;
    
			}
      console.log(msg)
    },

    setProgress: (message: string): void => progress.message(message),
    
  }
  
  const executor = await CopilotCliAgentExecutor.create([ 
          new NewCommandsCommandTool(progress), 
          ..._modules
        ], execContext );

  const _banner = await banner();

  p.intro( pc.green(_banner));
  
  do {

    const input = await p.text({
      message: 'Which commands would you like me to execute? ',
      placeholder: 'input prompt',
      initialValue: '',
      validate(value) {},
    });
  
    if( p.isCancel(input) ) {
      // return cancel( p.italic('goodbye! 👋'))
      return p.outro(pc.italic(pc.yellow('goodbye! 👋')))
      //process.exit(0)
    }
  
    try {
     
      progress.start();
      if( input.startsWith("#") || input.startsWith('?')) {

        await executor.run( input.substring(1) );

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

main();
