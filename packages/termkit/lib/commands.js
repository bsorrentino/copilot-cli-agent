var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _CommandsWindow_instances, _CommandsWindow_content, _CommandsWindow_iter, _CommandsWindow_log;
import termkit from '@bsorrentino/terminal-kit';
export class CommandsWindow {
    constructor(document) {
        _CommandsWindow_instances.add(this);
        this.document = document;
        this.win = null;
        _CommandsWindow_content.set(this, []);
        _CommandsWindow_iter.set(this, 1);
        const menuWidth = 15;
        const rowMenu = new termkit.RowMenu({
            parent: document,
            x: document.elements.title.outputWidth - menuWidth,
            y: 0,
            separator: '|',
            justify: true,
            width: menuWidth,
            items: [
                {
                    content: ' Commands ',
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
        });
        rowMenu.on('submit', () => {
            if (this.win !== null) {
                this.dismiss();
                document.focusNext();
            }
            else {
                this.win = createCommands(document, __classPrivateFieldGet(this, _CommandsWindow_content, "f"));
                this.win.on("clickOut", () => {
                    __classPrivateFieldGet(this, _CommandsWindow_instances, "m", _CommandsWindow_log).call(this, `${this.win?.hasFocus}`);
                    this.dismiss();
                });
                // this.win.on( "focus", ( focus:boolean , type:FocusType ) => {
                //     this.#log( `${focus} - ${type}`)
                // 	if( !focus && type === 'select') {
                // 		this.dismiss()
                // 	}
                // })	
                document.giveFocusTo(this.win);
            }
        });
    }
    dismiss() {
        this.win?.destroy();
        this.win = null;
    }
    setContent(content) {
        // const content1 = Array.from( { length: 30 } ).map( ( _ , i ) => `${i}th line of content...` ) ;
        // this.#log( content[0] )
        __classPrivateFieldSet(this, _CommandsWindow_content, content, "f");
    }
}
_CommandsWindow_content = new WeakMap(), _CommandsWindow_iter = new WeakMap(), _CommandsWindow_instances = new WeakSet(), _CommandsWindow_log = function _CommandsWindow_log(msg) {
    var _a, _b;
    const term = termkit.terminal;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(2, term.height, `${msg} - ${__classPrivateFieldSet(this, _CommandsWindow_iter, (_b = __classPrivateFieldGet(this, _CommandsWindow_iter, "f"), _a = _b++, _b), "f"), _a}`);
    ;
    term.restoreCursor();
};
/**
 * Creates a new termkit Window to display command options.
 *
 * @param document - The parent Document
 * @param content - Array of command name strings
 * @returns The new termkit Window instance
 */
function createCommands(document, content) {
    const window = new termkit.Window({
        parent: document,
        frameChars: 'lightRounded',
        x: document.elements.prompt.outputWidth - 49,
        y: 1,
        width: 50,
        height: termkit.terminal.height - 2,
        inputHeight: termkit.terminal.height - 2,
        title: "Commands",
        titleHasMarkup: false,
        movable: false,
        scrollable: true,
        vScrollBar: true,
        hScrollBar: false,
        zIndex: 2,
    });
    const text = new termkit.Text({
        parent: window,
        content: content,
        attr: { color: 'green', italic: true },
    });
    return window;
}
