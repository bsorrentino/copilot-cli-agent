import 'dotenv/config';
import termkit from '@bsorrentino/terminal-kit';
import { CopilotCliAgentExecutor, scanFolderAndImportPackage } from 'copilot-cli-core';
const term = termkit.terminal;
const document = term.createDocument();
document.outputWidth = term.width - 5;
term.clear();
// term.hideCursor() ;
new termkit.Layout({
    parent: document,
    boxChars: 'lightRounded',
    layout: {
        id: 'main',
        y: 0,
        widthPercent: 100,
        heightPercent: 100,
        rows: [
            {
                id: 'r0',
                // heightPercent: 1 ,
                height: 3,
                columns: [
                    { id: 'title' },
                ]
            },
            {
                id: 'r1',
                // heightPercent: 20,
                height: 8,
                columns: [
                    { id: 'prompt' },
                ]
            },
            {
                id: 'r2',
                columns: [
                    { id: 'content' },
                ]
            }
        ]
    }
});
new termkit.Text({
    parent: document.elements.title,
    content: "AI Prompt",
    attr: {
        color: 'brightMagenta',
        bold: true,
        italic: true
    }
});
const prompt = new termkit.LabeledInput({
    parent: document.elements.prompt,
    label: 'prompt: ',
    // x: 5 ,
    // y: 10 ,
    width: document.elements.prompt.outputWidth - 2,
    height: 5,
    allowNewLine: true,
    scrollable: true,
    vScrollBar: false,
    hScrollBar: false,
    autoWidth: 1,
});
const submit = new termkit.Button({
    parent: document.elements.prompt,
    content: '> SUBMIT',
    focusAttr: { bgColor: '@light-gray' },
    contentHasMarkup: true,
    value: 'submitButton',
    x: document.elements.prompt.outputWidth - 8,
    y: 5,
});
const output = new termkit.TextBox({
    parent: document.elements.content,
    scrollable: true,
    vScrollBar: true,
    width: document.elements.content.outputWidth,
    height: document.elements.content.outputHeight,
    autoHeight: 1,
    autoWidth: 1
});
function _log(msg, y = term.height) {
    if (y > term.height) {
        y = term.height;
    }
    term.saveCursor();
    term.moveTo.styleReset.eraseLine(2, y, msg);
    term.restoreCursor();
}
const execContext = {
    log: (msg) => output.appendLog(msg),
    progress: () => ({
        start: (msg) => { },
        stop: () => { }
    })
};
term.on('key', (key) => {
    switch (key) {
        case 'CTRL_C':
            term.grabInput(false);
            term.hideCursor(false);
            term.styleReset();
            term.clear();
            process.exit();
        default:
            term.saveCursor();
            // _log( `key: ${key}`, term.height - 1 ) ;
            term.restoreCursor();
    }
});
function spinner(content, task) {
    const spinner = new termkit.AnimatedText({
        parent: document,
        animation: 'asciiSpinner',
        x: 0,
        y: term.height - 1,
        attr: { bgColor: "white", color: "black" }
    });
    const text = new termkit.Text({
        parent: document,
        x: 1,
        y: term.height - 1,
        content: " running ...",
        attr: { bgColor: "white", color: "black" }
    });
    term.hideCursor(true);
    task.finally(() => {
        spinner.destroy();
        text.destroy();
        term.hideCursor(false);
    });
}
// log( `term.width: ${term.width}` ) ;
// log( `prompt.input.autoWidth: ${prompt.input.autoWidth}`, term.height - 1 ) ;
// document.focusNext();
document.giveFocusTo(prompt);
submit.on('parentResize', (coords) => submit.outputX = coords.width - 8);
prompt.on('parentResize', (arg) => {
    // fix: pass autowidth to input component
    // fix must be applied in "LabeledInput.prototype.initTextInput"
    // prompt.input.autoWidth =  1
    // fix: propagate resize event to input component
    prompt.input.onParentResize();
});
const main = async () => {
    const commandPath = process.env['COMMANDS_PATH'];
    if (!commandPath) {
        throw new Error("'COMMANDS_PATH' environment variable is not defined!");
    }
    const _modules = await scanFolderAndImportPackage(commandPath);
    const executor = await CopilotCliAgentExecutor.create(_modules, execContext);
    function onSubmit(input) {
        spinner('running...', executor.run(input)
            .then(result => { })
            .catch(e => execContext.log(e))
            .finally(() => {
            document.giveFocusTo(prompt);
        }));
    }
    submit.on('submit', (v) => onSubmit(prompt.getValue()));
    prompt.on('submit', onSubmit);
};
main();
