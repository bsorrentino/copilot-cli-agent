/// <reference types="node" resolution-mode="require"/>
import type { RunnableConfig } from "@langchain/core/runnables";
import * as path from 'node:path';
export declare const generateToolClass: (args: {
    name: string;
    desc: string;
    schema: string;
    command: string;
    path: string;
}, config?: RunnableConfig) => Promise<any>;
