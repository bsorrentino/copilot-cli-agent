import 'dotenv/config'

import { spawn } from 'child_process';


async function _call(arg: string ): Promise<string> {
    console.debug( "System Command:", arg)

    return new Promise<string>( (resolve, reject) => {
      const child =  spawn("find / -name '*.plist'", { shell:true} ) 

      // Read the output as a stream
      child.stdout.setEncoding('utf8')
      child.stdout.on('data', data => console.log(data.toString()) );
      child.stderr.setEncoding('utf8')
      child.stderr.on('data', data => console.log(data.toString()) );

      // Handle errors
      child.on('error', error => reject(error.message) );

      // Handle process exit
      child.on('close', code => resolve(`complete with code: ${code}`));

    })
  }



  _call( "find / -name '*.plist' 2>/dev/null" )
    .then( result => console.log( result ))
    .catch( e => console.error( "ERROR:", e ))