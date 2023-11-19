import 'dotenv/config'
import { fileURLToPath } from 'url';
import path from 'node:path'
import pc from 'picocolors'
import { intro, outro, text, isCancel, spinner } from '@clack/prompts';

import { 
  CopilotCliAgentExecutor, 
  ExecutionContext, 
  banner, 
  scanFolderAndImportPackage } from 'copilot-cli-core';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const main = async () => {

  // const _modules = await scanFolderAndImportPackage( path.join( __dirname, 'commands') );

  const commandPath = process.env['COMMANDS_PATH'];
  if(!commandPath ) {
    throw new Error("'COMMANDS_PATH' environment variable is not defined!");
  }
  const _modules = await scanFolderAndImportPackage( commandPath );
  
  const progress = spinner();

  const execContext:ExecutionContext = {

    log: (msg: string): void => 
      console.log(msg),
  
    setProgress: ( message: string ): void => 
      progress.message( message )
    
  }
  
  
  const executor = await CopilotCliAgentExecutor.create( _modules, execContext );

  const _banner = await banner();

  intro( pc.green(_banner));
  
  do {

    const input = await text({
      message: 'Which commands would you like me to execute? ',
      placeholder: 'input prompt',
      initialValue: '',
      validate(value) {},
    });
  
    if( isCancel(input) ) {
      // return cancel( p.italic('goodbye! 👋'))
      return outro(pc.italic(pc.yellow('goodbye! 👋')))
      //process.exit(0)
    }
  
    try {
     
      progress.start();
      await executor.run( input );
    
    }
    finally {
      progress.stop();
    }
  
  }
  while( true );

}

main();
