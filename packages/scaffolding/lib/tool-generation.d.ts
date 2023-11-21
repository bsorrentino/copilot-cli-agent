import * as path from 'node:path';
export declare const generateToolClass: (args: {
    name: string;
    desc: string;
    schema: string;
    command: string;
    path: string;
}) => Promise<string>;
