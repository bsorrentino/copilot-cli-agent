import 'dotenv/config'
import { fileURLToPath } from 'url';
import path from 'node:path'
import pc from 'picocolors'
import { intro, outro, text, isCancel, spinner } from '@clack/prompts';

import { CopilotCliAgentExecutor, ExecutionContext, Progress, banner, scanFolderAndImportPackage } from './copilot-cli-agent.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const execContext:ExecutionContext = {

  log: (msg: string) => console.log(msg) ,

  progress: ():Progress => spinner()
  
}


const main = async () => {

  const _modules = await scanFolderAndImportPackage( path.join( __dirname, 'commands') );
  
  const executor = await CopilotCliAgentExecutor.create( _modules, execContext );

  const _banner = await banner(__dirname);

  intro( pc.green(_banner));
  
  do {

    const input = await text({
      message: 'Which commands would you like me to execute? ',
      placeholder: '',
      initialValue: '',
      validate(value) {
        
      },
    });
  
    if( isCancel(input) ) {
      // return cancel( p.italic('goodbye! 👋'))
      return outro(pc.italic(pc.yellow('goodbye! 👋')))
      //process.exit(0)
    }
  
    try {
     
      const result = await executor.run( input );
      execContext.log(result);
    
    }
    catch( e:any ) {
      execContext.log( e )
    }
  
  }
  while( true );

}

main();
