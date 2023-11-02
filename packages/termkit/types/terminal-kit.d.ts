import type NextGenEvents from 'nextgen-events';
import { Terminal } from 'terminal-kit';

declare module 'terminal-kit' {

    class Document {
        elements:Record<string,Element>
        constructor(options?: any);
        destroy(isSubDestroy: any, noDraw?: boolean): void;
        assignId(element: any, id: any): void;
        unassignId(element: any, id: any): void;
        giveFocusTo(element: any, type?: string): any;
        giveFocusTo_(element: any, type: any): any;
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
        getValue(): any;
        // setValue(): undefined;
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

    class Text extends Element {
        constructor(options: Partial<TextOptions>);
        computeRequiredWidth(): any;
        computeRequiredHeight(): any;
        resizeOnContent(): void;
        postDrawSelf(): this | undefined;
    }

    class Button extends Element {
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
        input:any;

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

    interface ElementOptions {
        internal: boolean;
        parent: unknown;
        id: string;
        y: number;
        x: number;
        height: number;
        width: number;
        meta: any;
        content: string;
        contentHasMarkup: any;

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
    

}