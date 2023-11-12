import termkit, { Document, FocusType } from '@bsorrentino/terminal-kit' ;


export class CommandsVindow {
	private win:termkit.Window|null = null
	#content:string[] = []
	#iter = 1

	constructor( private document: Document ) {
		const menuWidth = 15
	
		const rowMenu = new termkit.RowMenu( {
			parent: document ,
			x: document.elements.title.outputWidth - menuWidth  ,
			y: 0,
			separator: '|' ,
			justify: true ,
			width: menuWidth ,
			items: [
				{
					content: ' Commands ' ,
					value: 'file'
				},
				// {
				// 	content: 'Edit' ,
				// 	value: 'edit'
				// } ,
				// {
				// 	content: 'View' ,
				// 	value: 'view'
				// } ,
				// {
				// 	content: '^rHistory' , 
				// 	markup: true ,
				// 	value: 'history'
				// } ,
				// {
				// 	content: 'Bookmarks' ,
				// 	value: 'bookmarks'
				// } ,
				// {
				// 	content: 'Tools' ,
				// 	value: 'tools'
				// } ,
				// {
				// 	content: 'Help' ,
				// 	value: 'help'
				// } ,
			]
		} ) ;
		
		rowMenu.on( 'submit' , () => {
			if( this.win !== null ) {
				this.dismiss()
				document.focusNext()
			}
			else {
				this.win = createCommands(document, this.#content);
				this.win.on( "clickOut", () => {
                    this.#log( `${this.win?.hasFocus}`)
					this.dismiss()
				})
				// this.win.on( "focus", ( focus:boolean , type:FocusType ) => {
                //     this.#log( `${focus} - ${type}`)
				// 	if( !focus && type === 'select') {
				// 		this.dismiss()
				// 	}
				// })	
				document.giveFocusTo( this.win )
			}
		})
	}

    dismiss() {
        this.win?.destroy()
        this.win = null
    }

	setContent( content:string[] ) {
		// const content1 = Array.from( { length: 30 } ).map( ( _ , i ) => `${i}th line of content...` ) ;
		// this.#log( content[0] )
		this.#content = content ;
	}

	#log( msg:string ) {
		const term = termkit.terminal
	
		term.saveCursor() ;
		term.moveTo.styleReset.eraseLine( 2 , term.height, `${msg} - ${this.#iter++}` ) ; ;
		term.restoreCursor() ;
	}
	
}


function createCommands( document: Document, content:string[] ) {
	
	const window = new termkit.Window( {	
		parent:  document ,
		frameChars: 'lightRounded' ,
		x: document.elements.prompt.outputWidth - 49,
		y: 1,
		width: 50 ,
		height: termkit.terminal.height - 2 ,
		inputHeight: termkit.terminal.height - 2,
		title: "Commands",
		titleHasMarkup: false ,
		movable: false ,
		scrollable: true ,
		vScrollBar: true ,
		hScrollBar: false,
		zIndex: 2,
	} ) ;
	
	const text = new termkit.Text( {
		parent: window ,
		content: content,
		attr: { color: 'green' , italic: true },
	} );


	return window
}
