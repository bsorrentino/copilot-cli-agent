import termkit from '@bsorrentino/terminal-kit';
function _log(msg) {
    const term = termkit.terminal;
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(2, term.height, msg);
    term.restoreCursor();
}
export class CommandsVindow {
    constructor(document) {
        this.document = document;
        this.win = null;
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
                this.win.destroy();
                this.win = null;
                document.focusNext();
            }
            else {
                this.win = createCommands(document);
                this.win.on("focus", (focus, type) => {
                    _log(`${focus} - ${type}`);
                    if (!focus && type === 'select') {
                        this.win.destroy();
                        this.win = null;
                    }
                });
                document.giveFocusTo(this.win);
            }
        });
    }
}
function createCommands(document) {
    const content = Array.from({ length: 30 }).map((_, i) => `${i}th line of content...`);
    const window = new termkit.Window({
        parent: document,
        frameChars: 'lightRounded',
        x: document.elements.prompt.outputWidth - 49,
        y: 1,
        width: 50,
        height: termkit.terminal.height - 2,
        inputHeight: content.length,
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
