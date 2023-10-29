import 'dotenv/config'

import pc from 'picocolors'
import { intro, outro, text, isCancel, spinner } from '@clack/prompts';

import { CopilotCliAgentExecutor, ExecutionContext, Progress, banner } from './copilot-cli-agent.js';


const execContext:ExecutionContext = {

  log: (msg: string) => console.log(msg) ,

  progress: ():Progress => spinner()
  
}


const main = async () => {

  const executor = await CopilotCliAgentExecutor.create( execContext );

  intro( pc.green(banner));
  
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
