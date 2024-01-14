"use strict";
/// <reference path="../types/blessed-fix.d.ts" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const blessed = __importStar(require("blessed"));
const node_path_1 = __importDefault(require("node:path"));
const copilot_cli_core_1 = require("copilot-cli-core");
const toInt = (v) => (typeof v === 'string') ? parseInt(v) : v;
const screen = blessed.screen({
    smartCSR: true,
    autoPadding: false,
    warnings: true
});
const promptForm = blessed.form({
    parent: screen,
    keys: true,
    left: 0,
    top: 0,
    width: '100%',
    height: 6,
    // bg: 'green',
    // content: 'Submit or cancel?'
});
const promptBox = blessed.box({
    parent: promptForm,
    label: "Prompt",
    name: 'prompt_box',
    border: 'line',
    style: {
        fg: 'white',
        bg: 'blue'
    },
    width: '100%',
    height: 5,
    top: promptForm.top,
    left: 0,
    // inputOnFocus: true,
    // scrollable: true,
    keys: true,
    mouse: true,
});
const placeholder = blessed.text({});
const promptText = blessed.textarea({
    parent: promptBox,
    name: 'prompt_text',
    $: { placeholder: 'Enter text here' },
    style: {
        fg: 'white',
        bg: 'blue'
    },
    top: 1,
    left: 1,
    width: '100%-5',
    height: toInt(promptBox.height) - 2,
    inputOnFocus: true,
    scrollable: true,
    keys: true,
    mouse: true,
});
const submit = blessed.button({
    parent: promptForm,
    shrink: true,
    padding: { left: 2, right: 2 },
    right: 1,
    top: toInt(promptText.height) + 1,
    name: 'subprompt_submitmit',
    content: 'Submit',
    style: {
        bold: true,
        bg: 'black',
        focus: {
            bg: 'green'
        },
        hover: {
            bg: 'green'
        }
    }
});
const cancel = blessed.button({
    parent: promptForm,
    name: 'prompt_cancel',
    shrink: true,
    padding: (v => toInt(promptText.height) > 3 ? { top: 1, bottom: 1, ...v } : v)({ left: 1, right: 1 }),
    right: 1,
    top: toInt(promptText.top) + 1,
    content: 'X',
    style: {
        bold: true,
        fg: 'black',
        bg: 'yellow',
        focus: {
            bg: 'red'
        },
        hover: {
            bg: 'red'
        }
    }
});
const logger = blessed.log({
    parent: screen,
    label: { text: 'Result', side: 'center' },
    top: toInt(promptBox.height) + 1,
    width: '100%',
    height: `100%-${toInt(promptBox.height) + 1}`,
    border: 'line',
    tags: true,
    keys: true,
    vi: true,
    mouse: true,
    scrollback: 100,
    scrollbar: {
        ch: ' ',
        track: {
            bg: 'yellow'
        },
        style: {
            inverse: true
        }
    }
});
const loader = blessed.loading({
    parent: screen,
    border: 'line',
    height: 4,
    width: 'half',
    top: 'center',
    left: 'center',
    label: ' {blue-fg}AI Agent{/blue-fg} ',
    tags: true,
    keys: true,
    hidden: true
});
class ExecutionContextImpl {
    constructor(verbose = false) {
        this.verbose = verbose;
        this.history = new copilot_cli_core_1.CommandHistory();
    }
    setProgress(message) {
    }
    log(message, attr) {
        logger.log(message);
    }
}
const main = async () => {
    const execContext = new ExecutionContextImpl();
    const _modules = await (0, copilot_cli_core_1.scanFolderAndImportPackage)(node_path_1.default.join(__dirname, 'commands'));
    const executor = await copilot_cli_core_1.CopilotCliAgentExecutor.create(_modules, execContext);
    const submitAction = () => promptForm.submit();
    submit.on('press', submitAction);
    submit.on('click', submitAction);
    const cancelAction = () => promptForm.reset();
    cancel.on('press', cancelAction);
    cancel.on('click', cancelAction);
    promptForm.on('submit', data => {
        // logger.log( "submitted: {bold}%s{/bold} - lastSubmit:  - %s", 
        //           data, promptForm.submission, Date.now().toString() );
        loader.load("running...");
        executor.run(data.prompt_text)
            .finally(() => loader.stop());
    });
    promptForm.on('reset', data => {
        logger.log("reset - data: %s", data);
        promptText.focus();
        screen.render();
    });
    screen.key('q', () => process.exit(0));
    promptText.focus();
    screen.render();
};
main();
