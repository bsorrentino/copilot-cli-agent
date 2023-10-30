import 'zx/globals'

const isJsFile = async ( f ) => 
    path.extname(f) === '.js' && (await fs.stat(f)).isFile()


const outDir = 'dist.cjs'

const files = await fs.readdir( outDir, {recursive: true })

for( let f of files ) {
    
    const fPath = path.join( outDir,f)
    
    if( !(await isJsFile(fPath)) ) continue

    await fs.rename( fPath, fPath.replace( /.js$/, '.cjs') )

    console.log( `file ${fPath} renamed!` )
}

