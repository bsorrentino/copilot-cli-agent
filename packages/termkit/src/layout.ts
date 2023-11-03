//// <reference path="../types/terminal-kit.d.ts" />
"use strict" ;

import termkit, { CoordsOptions, TerminalEx } from 'terminal-kit' ;

const term = termkit.terminal as TerminalEx ;

const document = term.createDocument() ;

term.clear() ;
// term.hideCursor() ;

const layout = new termkit.Layout( {
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

// layout.draw() ;
// layout.setAutoResize( true ) ;


// new termkit.Text( {
// 	parent: document.elements.percent ,
// 	content: 'Percent sized box' ,
// 	attr: { color: 'red' }
// } ) ;

// new termkit.Text( {
// 	parent: document.elements.auto ,
// 	content: 'Auto sized box' ,
// 	attr: { color: 'green' , italic: true }
// } ) ;

// new termkit.Text( {
// 	parent: document.elements.auto2 ,
// 	content: 'Auto sized box (2)' ,
// 	attr: { color: 'yellow' , italic: true }
// } ) ;

// new termkit.Text( {
// 	parent: document.elements.fixed ,
// 	content: 'Fixed size box' ,
// 	attr: { color: 'cyan' , bold: true }
// } ) ;

// new termkit.Text( {
// 	parent: document.elements.fixed2 ,
// 	content: 'Fixed size box (2)' ,
// 	attr: { color: 'magenta' , bold: true }
// } ) ;

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
	autoWidth: 1,
	width: term.width - 2 ,
	height: 5 ,
	allowNewLine: true,
	scrollable: true,
	vScrollBar: false,
	hScrollBar: false,
	
} ) ;

const submit = new termkit.Button( {
	parent: document.elements.prompt ,	
	content: '> SUBMIT' ,
	focusAttr: { bgColor: '@light-gray' } ,
	contentHasMarkup: true ,
	value: 'submitButton' ,
	x: prompt.outputWidth - 8 ,
	y: 5 ,
} ) ;

const output = new termkit.TextBox({
	parent: document.elements.content,	
	scrollable: true,
	vScrollBar: true,
	width: term.width - 2,
	height: document.elements.content.outputHeight,
});

function log( msg:string, y = term.height ) {
	if( y > term.height ) { y = term.height ; }

	term.saveCursor() ;
	term.moveTo.styleReset.eraseLine( 1 , y , msg ) ;
	term.restoreCursor() ;
}

function onSubmit( value: string )
{
	output.appendLog( `Submitted: ${value}\n` ) ;
}

log( `term.width: ${term.width}` ) ;
// document.focusNext();
document.giveFocusTo( prompt ) ;

term.on( 'key' ,  (key:string) => {
    
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
			log( `key: ${key}`, term.height - 1 ) ;
            term.restoreCursor() ;
	}
} ) ;

submit.on( 'submit' , ( v ) => onSubmit( prompt.getValue() ) ) ;
submit.on( 'parentResize' , (coords:CoordsOptions) => 
	submit.outputX = coords.width - 8 
);

prompt.on( 'submit' , onSubmit ) ;
prompt.on( 'parentResize' , (arg:CoordsOptions) =>  {
	// fix: pass autowidth to input component
	// fix must be applied in "LabeledInput.prototype.initTextInput"
	prompt.input.autoWidth =  1
	// fix: propagate resize event to input component
	prompt.input.onParentResize()
	
}) ;

// term.on( 'resize' , ( w:number, h:number ) => {
// 	log( `resize w: ${w} - h: ${h} - outputDst: ${prompt.input.outputDst.width}` ) ;
// })
//term.moveTo( 1 , term.height ) ;
