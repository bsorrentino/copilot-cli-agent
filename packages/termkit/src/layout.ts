import 'dotenv/config'
import termkit, { CoordsOptions, FocusType, Element } from '@bsorrentino/terminal-kit' ;
import { CopilotCliAgentExecutor, ExecutionContext, LogAttr, scanFolderAndImportPackage } from 'copilot-cli-core';
import { CommandsWindow } from './commands.js'; 
import fs from 'node:fs/promises';

const term = termkit.terminal ;

const document = term.createDocument() ;

term.clear() ;
// term.hideCursor() ;

new termkit.Layout( {
	parent: document ,
	boxChars: 'lightRounded',
	layout: {
		id: 'main' ,
		y: 0 ,
		widthPercent: 100 ,
		heightPercent: 100 ,
		rows: [
			{
				id: 'r0' ,
				// heightPercent: 1 ,
				height: 3,
				columns: [
					{ id: 'title' } ,
				]
			},
			{
				id: 'r1' ,
				// heightPercent: 20,
				height: 8,
				columns: [
					{ id: 'prompt' } ,
				]
			},
			{
				id: 'r2' ,
				columns: [
					{ id: 'content' } ,
				]
			}
		]
	}
} ) ;

new termkit.Text( {
	parent: document.elements.title,
	content: "AI Prompt" ,
	attr: {
		color: 'brightMagenta' ,
		bold: true ,
		italic: true
	}
} ) ;

const prompt = new termkit.LabeledInput( {
	parent: document.elements.prompt,
	label: 'prompt: ',
	// x: 5 ,
	// y: 10 ,
	width: document.elements.prompt.outputWidth - 2 ,
	height: 5 ,
	allowNewLine: true,
	scrollable: true,
	vScrollBar: false,
	hScrollBar: false,
	autoWidth: 1,
	
} ) ;

const submit = new termkit.Button( {
	parent: document.elements.prompt ,	
	content: '> SUBMIT' ,
	focusAttr: { bgColor: '@light-gray' } ,
	contentHasMarkup: true ,
	value: 'submitButton' ,
	x: document.elements.prompt.outputWidth - 8 ,
	y: 5 ,
} ) ;

const output = new termkit.TextBox({
	parent: document.elements.content,	
	scrollable: true,
	vScrollBar: true,
	hScrollBar: true,
	width: document.elements.content.outputWidth,
	height: document.elements.content.outputHeight,
	autoHeight: 1,
	autoWidth: 1,
	contentHasMarkup: true
});



term.on( 'key',  (key:string) => {
		
	switch( key )
	{
		case 'CTRL_C' :
			term.grabInput( false ) ;
			term.hideCursor( false ) ;
			term.styleReset() ;
			term.clear() ;
			process.exit() ;
		default: 
			term.saveCursor() ;
			// _log( `key: ${key}`, term.height - 1 ) ;
			term.restoreCursor() ;
	}
}) ; 

// log( `term.width: ${term.width}` ) ;
// log( `prompt.input.autoWidth: ${prompt.input.autoWidth}`, term.height - 1 ) ;

// document.focusNext();
document.giveFocusTo( prompt ) ;

submit.on( 'parentResize' , (coords:CoordsOptions) => 
	submit.outputX = coords.width - 8 
);

prompt.on( 'parentResize' , (arg:CoordsOptions) =>  {
	// fix: pass autowidth to input component
	// fix must be applied in "LabeledInput.prototype.initTextInput"
	// prompt.input.autoWidth =  1
	// fix: propagate resize event to input component
	prompt.input.onParentResize()
});

const commands = new CommandsWindow( document );

const main = async () => {

	const logger = await fs.open('./log.txt', 'a+')

	const commandPath = process.env['COMMANDS_PATH'];
	if(!commandPath ) {
	  throw new Error("'COMMANDS_PATH' environment variable is not defined!");
	}
	const _modules = await scanFolderAndImportPackage( commandPath );
	
	commands.setContent( [ "system_cmd", ..._modules.map( m => m.name )] );
	
	const spinner = new SpinnerElement() ;

	const execContext:ExecutionContext = {
		verbose: true,
		log: (msg: string, attr?: LogAttr) => {
			switch(attr) {
				case 'red':
					msg = `^R${msg}`;
					break;
				case 'inverse':
					msg = `^!${msg}`;
					break;
				case 'dim':
					msg = `^-${msg}`;
					break;
			}
			output.appendLog( msg )
		},

		setProgress: ( msg: string ) => {
			spinner.setContent( msg )
			logger.appendFile( `${msg}\n` )
		}
		
	}
	
	const executor = await CopilotCliAgentExecutor.create( _modules, execContext );

	function onSubmit( input: string ) {

		output.setContent('', true)
		// start fix: scroll bars disappear
		output.hasVScrollBar = true
		output.hasHScrollBar = true
		output.redraw( true )
		// end fix: scroll bars disappear

		spinner.startAsync( document, 1, term.height - 1, 'running...', 
			executor.run( input )
				.then( result => { /* execContext.log(result) */ } )
				.catch( e => execContext.log( e ))
				
		).finally( () => {
			document.giveFocusTo( prompt );
		})	
	}
	
	submit.on( 'submit' , ( ) => onSubmit( prompt.getValue() ) ) ;
	
	prompt.on( 'submit' , onSubmit ) ;
	
}

main()


class SpinnerElement<T extends Element = Element> implements Disposable {

	spinner:termkit.AnimatedText|null = null ;
	text:termkit.Text|null = null;

	#init( parent: T, x:number, y:number, content:string ) {
		this.spinner = new termkit.AnimatedText( {
			parent: parent ,
			animation: 'asciiSpinner' ,
			x:  x,
			y: y,
			attr: { bgColor: "white", color: "black" }
		}) ;
		this.text = new termkit.Text( {
			parent: parent,
			x: x + 1,
			y: y,
			content: ` ${content}`,
			attr: { bgColor: "white", color: "black" }
		})
		return this;
	}

	async startAsync( parent: T, x:number, y:number, content:string, task: Promise<void> ): Promise<void> {
		this.start(parent, x, y, content);

		return task.finally(() => {
			this.#stop()
		})
	}

	start( parent: T, x:number, y:number, content:string ): Disposable {
		this.#init(parent, x, y, content)
		term.hideCursor(true);
		return this
	}

	setContent( content:string ) {
		this.text?.setContent(content, true, false, true);
	}

	#stop(): void {
		// this.text?.detach();
		// this.spinner?.parent.attach( this.text )
		this.text?.destroy()
		this.spinner?.destroy();
		term.hideCursor(false);
		this.spinner = null
		this.text = null
	}
	
	[Symbol.dispose](): void {
		this.#stop();
	}
}

