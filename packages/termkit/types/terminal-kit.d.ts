import type NextGenEvents from 'nextgen-events';
import { Terminal } from 'terminal-kit';

declare module 'terminal-kit' {

    interface GlobalEventHandlersEventMap {
        parentResize: "parentResize"
    }

    class Document {
        elements:Record<string,Element>
        constructor(options?: any);
        destroy(isSubDestroy: any, noDraw?: boolean): void;
        assignId(element: any, id: any): void;
        unassignId(element: any, id: any): void;
        giveFocusTo(element: any, type?: string): any;
        // giveFocusTo_(element: any, type: any): any;
        focusNext(): void;
        focusPrevious(): void;
        bubblingEvent(element: any, key: any, altKeys: any, data: any): void;
        defaultKeyHandling(key: any, altKeys: any, data: any): void;
        setMetaKeyPrefix(prefix: any, remove: any): void;
        getDocumentClipboard(key?: string): any;
        setDocumentClipboard(value: any, key?: string): void;
        clearDocumentClipboard(value: any, key?: string): void;
        createShortcuts(element: any, ...keys: any[]): void;
        removeElementShortcuts(element: any): void;

        mouseClick(data: any, clickType?: string): void;
        mouseMotion(data: any, exclude?: null): void;
        mouseMotionStart(data: any): void;
        mouseMotionEnd(): void;
        mouseDrag(data: any): void;
        mouseDragStart(data: any): void;
        mouseDragEnd(data: any): void;
        mouseWheel(data: any): void;
    }

    type TerminalEx = Terminal & { createDocument: () => Document };
    
    class Element extends NextGenEvents {
        autoHeight: number;
        autoWidth: number;

        outputDst:number;
        outputX:number;
        outputY:number;
        outputWidth:number;
        outputHeight:number;

        inputDst:number;
	    inputX:number;
	    inputY:number;
	    inputWidth:number;
	    inputHeight:number;

        constructor(options?: Partial<ElementOptions>);

        destroy(isSubDestroy?: boolean, noDraw?: boolean): void;
        debugId(): string;
        show(noDraw?: boolean): this;
        hide(noDraw?: boolean): this;
        clear(): void;
        attach(child: any, id: any): this;
        attachTo(parent: any, id: any): this;
        recursiveFixAttachment(document: any, id?: any): void;
        detach(noDraw?: boolean): this | undefined;
        resizeToContent(): void;
        zSort(): void;
        zInsert(child: any): void;
        updateZ: (z: any) => void;
        updateZIndex(z: any): void;
        topZ(): any;
        bottomZ(): any;
        restoreZ(): any;
        setContent(content: any, hasMarkup: any, dontDraw?: boolean, dontResize?: boolean): void;
        isAncestorOf(element: any): boolean;
        getParentContainer(): any;
        getFocusBranchIndex(): any;
        focusNextChild(loop?: boolean, type?: string): any;
        focusPreviousChild(loop?: boolean): any;
        childrenAt(x: any, y: any, filter?: null, matches?: any[]): any[];
        saveCursor(): this;
        restoreCursor(): this;
        draw(isInitialInlineDraw?: boolean): this;
        redraw: (force?: boolean) => this;
        outerDraw(force?: boolean): this;
        updateDraw(): void;
        descendantDraw(isSubcall: any): this;
        ascendantDraw(): this;
        drawCursor(): this;
        bindKey(key: any, action: any): void;
        getKeyBinding(key: any): any;
        getKeyBindings(key: any): {};
        getActionBinding(action: any, ui?: boolean): any[];
        getValue(): unknown;
        // setValue(): undefined;
        on( eventName: "parentResize", 
            fn?:( coords:CoordsOptions ) => void,
            options?: NextGenEvents.AddListenerOptions): this;   
        on( eventName: "submit", 
            fn?:( value:string ) => void,
            options?: NextGenEvents.AddListenerOptions): this;    
     
    }

    class Layout extends Element {
        constructor(options?: Partial<LayoutOptions>);
        computeBoundingBoxes(): void;
        computeBoundingBoxes_(layoutDef: any, computed: any, parent: any, inProgress: any): void;
        computeDxDy(layoutDef: any, computed: any, parent: any, inProgress: any, firstPass: any): void;
        round(computed: any): void;
        preDrawSelf(): void;
        drawRecursive(computed: any, tees: any): void;
        drawColumn(computed: any, tees: any, last: any): void;
        drawTee(x: any, y: any, type: any, tees: any): void;
        drawRow(computed: any, tees: any, last: any): void;
    }

    class Slider extends Element {

        constructor(options: any);

        // onClick: () => void;
        // onDrag: () => void;
        // onWheel: () => void;
        // onButtonSubmit: () => void;

        isVertical: boolean;
        slideRate: number;
        handleOffset: number;
        rateToValue: any;
        valueToRate: any;

        buttonBlurAttr: Attr;
        buttonFocusAttr: Attr;
        buttonSubmittedAttr: Attr;
        handleAttr: Attr;
        barAttr: Attr;

        backwardSymbol: any;
        forwardSymbol: any;
        handleSymbol: any;
        barSymbol: any;
        backwardButton: Button | null;
        forwardButton: Button | null;
        needInput: boolean;
        outerDrag: boolean;
        keyBindings: {
            UP: string;
            DOWN: string;
            LEFT: string;
            RIGHT: string;
            PAGE_UP: string;
            PAGE_DOWN: string;
            ' ': string;
            HOME: string;
            END: string;
        };
        buttonKeyBindings: {
            ENTER: string;
            KP_ENTER: string;
        };
        private initChildren(): void;
        private preDrawSelf(): void;
        private preDrawSelfVertical(): void;
        private preDrawSelfHorizontal(): void;
        private postDrawSelf(): void;

        setSizeAndPosition(options: any): void;
        computeHandleOffset(): void;
        setHandleOffset(offset: any, internalAndNoDraw?: boolean): void;
        setSlideRate(rate: any, internalAndNoDraw?: boolean): void;
        getValue(): unknown;
        setValue(value: unknown, internalAndNoDraw: any): void;
        getHandleOffset(): number;
        getSlideRate(): number;
    
    }

    class Text extends Element {
        constructor(options: Partial<TextOptions>);
        computeRequiredWidth(): any;
        computeRequiredHeight(): any;
        resizeOnContent(): void;
        postDrawSelf(): this | undefined;
    }

    class TextBox extends Element {
        // onClick: any;
        // onDrag: any;
        // onWheel: any;
        // keyBindings: any;

        textAttr: Attr;
        altTextAttr: Attr;
        voidAttr: Attr;

        scrollable: boolean;
        hasVScrollBar: boolean;
        hasHScrollBar: boolean;
        scrollX: number;
        scrollY: number;
        vScrollBarSlider: Slider | null;
        hScrollBarSlider: Slider | null;

        extraScrolling: boolean;
        autoScrollContextLines: any;
        autoScrollContextColumns: any;
        firstLineRightShift: any;

        tabWidth: number;
        wordWrap: boolean;
        lineWrap: boolean;
        hiddenContent: boolean;
        stateMachine: any;
        
        textAreaWidth: number;
        textAreaHeight: number;
        textBuffer: TextBuffer | null;
        altTextBuffer: TextBuffer | null;
        strictInlineSupport: boolean;

        constructor( options: Partial<TextBoxOptions> );

        private initChildren(): void;

        onParentResize(): void;
        setSizeAndPosition(options: any): void;
        preDrawSelf(): void;
        scrollTo(x: any, y: any, noDraw?: boolean): void;
        scroll(dx: any, dy: any, dontDraw?: boolean): void;
        scrollToTop(dontDraw?: boolean): void;
        scrollToBottom(dontDraw?: boolean): void;
        autoScrollAndDraw(onlyDrawCursorExceptIfScrolled?: boolean, noDraw?: boolean): void;
        autoScrollAndSmartDraw(): void;
        setAttr(textAttr?: any, voidAttr?: any, dontDraw?: boolean, dontSetContent?: boolean): void;
        setAltAttr(altTextAttr?: any): void;
        getContentSize(): {
            width: number;
            height: number;
        };
        getContent(): string;
        setContent(content: string, hasMarkup?: boolean, dontDraw?: boolean): void;
        getAltContent(): string | null;
        setAltContent(content: string, hasMarkup?: boolean, dontDraw?: boolean): void;
        prependContent(content: string, dontDraw?: boolean): void;
        appendContent(content: string, dontDraw?: boolean): void;
        appendLog(content: string, dontDraw?: boolean): void;
        private addContent(content: string, mode: string, dontDraw?: boolean): void;
        setTabWidth(tabWidth: number, internal?: boolean): void;

        setStateMachine(stateMachine: any, internal?: boolean): void;
    
    }

    class EditableTextBox extends TextBox {
        constructor( options: any );
    }

    class Button extends Text {
        constructor(options:Partial<ButtonOptions>);

        setContent(content: any, hasMarkup: boolean, dontDraw?: boolean, dontResize?: boolean): void;
        computeContentWidth(): number;
        computeRequiredWidth(): number;
        drawSelfCursor(): void;
        blink(special?: null, animationCountdown?: number): void;
        updateStatus(): void;
        submit(special: any): void;
        unsubmit(): void;
    
    }

    class LabeledInput extends Element {
        input:EditableTextBox;

        constructor(options:Partial<LabeledInputOptions>);

        private initInput(options: any): void;
        private initTextInput(options: any): void;
        private initSelectInput(options: any): void;
        private initSelectMultiInput(options: any): void;
        private onKey(key: any, altKeys: any, data: any): any;
        private onChildFocus(focus: any, type: any): void;
        private drawSelfCursor(): void;

        updateStatus(): void;
        getValue(): string;
        setValue(value: string, dontDraw?: boolean): string;
        getContent(): string;
        setContent(content: string, hasMarkup?: boolean, dontDraw?: boolean): any;
    }

    interface ScrollableOptions {
		scrollable: boolean ,
		vScrollBar: boolean,
        hScrollBar: boolean,
    }

    type Bindings = Record<string, string>;

    interface CoordsOptions {
        y: number;
        x: number;
        height: number;
        width: number;    
    }

    interface ElementOptions extends CoordsOptions {
        internal: boolean;
        parent: unknown;
        id: string;
        meta: any;

        content: string;
        contentHasMarkup: boolean;

        outputDst: any;
        childId: any;
        autoWidth: number;
        strictInline: any;
        outputY: number;
        disabled: any;
        interceptTempZIndex: any;
        zIndex: number;
        outputX: number;
        label: string;
        autoHeight: number;
        value: any;
        hidden: boolean;
        z: number;
        shortcuts?: any[];
        inlineTerm: any|null;
        outputHeight: any;
        def: any|null;
        key: any|null;
        outputWidth: any;
    }

    interface LayoutElement {
        id: string,
        x?: number,
		y?: number ,
        width?: number,
        height?: number,
	    widthPercent?: number ,
		heightPercent?: number,
        columns?: Array<LayoutElement>
        rows?: Array<LayoutElement>
    }

    interface TextOptions extends ElementOptions {
        attr:Partial<Attr>;
        leftPadding: string;
        rightPadding: string;
    }

    interface TextBoxOptions extends ElementOptions, ScrollableOptions {

        // keyBindings?: any;
        textAttr: Partial<Attr>;
        altTextAttr: Partial<Attr>;
        voidAttr: Partial<Attr>;

        scrollX: number;
        scrollY: number;
        extraScrolling: boolean;
        autoScrollContextLines: number;
        autoScrollContextColumns: number;

        firstLineRightShift: number;
        tabWidth: number;
        wordWrap: boolean;
        lineWrap: boolean;
        hiddenContent: boolean;
        // stateMachine: any; // https://github.com/cronvel/text-machine/
        noDraw: boolean;
    }

    interface LayoutOptions extends ElementOptions {
        boxChars: Terminal.CustomBorderObject | Terminal.BuiltinBorder;
        layout: LayoutElement;

    }

    type Attr =  {
        bgColor: string, 
        color: string, 
        bold: boolean,
        italic: boolean, 
        dim: boolean };

    interface LabeledInputOptions extends ElementOptions, ScrollableOptions {
        hiddenContent: boolean;
        labelFocusAttr: Partial<Attr>;
        labelBlurAttr: Partial<Attr>;
        buttonBlurAttr: Partial<Attr>;
        buttonFocusAttr: Partial<Attr>;
        buttonDisabledAttr: Partial<Attr>;
        buttonSubmittedAttr: Partial<Attr>;
        turnedOnBlurAttr: Partial<Attr>;
        turnedOnFocusAttr: Partial<Attr>;
        turnedOffBlurAttr: Partial<Attr>;
        turnedOffFocusAttr: Partial<Attr>;
        textAttr: Partial<Attr>;
        voidAttr: Partial<Attr>;
        emptyAttr: Partial<Attr>;
        keyBindings: Bindings;
        type: string;
        noDraw: boolean;     
        allowNewLine: boolean;
        lineWrap:boolean;
		wordWrap:booelan;

    }
    
    interface ButtonOptions extends ElementOptions {
        leftPadding: string;
        rightPadding: string;
        
        blurLeftPadding: string;
        blurRightPadding: string;
        
        focusLeftPadding: string;
        focusRightPadding: string;
        
        disabledLeftPadding: string;
        disabledRightPadding: string;

        submittedLeftPadding: string;
        submittedRightPadding: string;

        turnedOnBlurLeftPadding: string;
        turnedOnLeftPadding: string;
        turnedOnBlurRightPadding: string;
        turnedOnRightPadding: string;
        turnedOnFocusLeftPadding: string;
        turnedOnFocusRightPadding: string;

        turnedOffBlurLeftPadding: string;
        turnedOffLeftPadding: string;
        turnedOffBlurRightPadding: string;
        turnedOffRightPadding: string;
        turnedOffFocusLeftPadding: string;
        turnedOffFocusRightPadding: string;

        blurAttr: Partial<Attr>;
        focusAttr: Partial<Attr>;
        disabledAttr: Partial<Attr>;
        submittedAttr: Partial<Attr>;
        turnedOnBlurAttr: Partial<Attr>;
        turnedOnFocusAttr: Partial<Attr>;
        turnedOffBlurAttr: Partial<Attr>;
        turnedOffFocusAttr: Partial<Attr>;

        contentHasMarkup: boolean;
        paddingHasMarkup: boolean;

        // internalRole: any;
        disabled: boolean;
        submitted: any;
        submitOnce: boolean;
        keyBindings: Binding;
        actionKeyBindings: Binding;
        noDraw: boolean;
    }

}