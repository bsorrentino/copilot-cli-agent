import { StructuredTool } from 'langchain/tools';
import { z } from 'zod';
export interface Progress {
    start(message: string): void;
    stop(): void;
}
type Color = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';
export type LogOptions = {
    fg: Color;
};
/**
 * Interface for execution context passed to command tools.
 * Provides logging and progress tracking capabilities.
*/
export interface ExecutionContext {
    progress(): Progress;
    log(message: string, options?: Partial<LogOptions>): void;
}
/**
 * Abstract base class for command tools. Extends StructuredTool and adds an optional ExecutionContext property.
 *
 * Command tools represent CLI commands that can be executed. They define a schema for their inputs and implement the
 * _call method to handle execution. The ExecutionContext allows them to access logging and other context services.
*/
export declare abstract class CommandTool<T extends z.ZodObject<any, any, any, any>> extends StructuredTool<T> {
    protected execContext?: ExecutionContext;
    constructor(execContext?: ExecutionContext);
}
/**
 * Loads and returns the contents of the banner.txt file.
 *
 * This function is used to display a banner when the CLI starts up.
 * It loads the banner text from the provided banner.txt file.
 *
 * @param dirname - The directory containing the banner.txt file.
 * @returns A promise resolving to the banner text string.
 * @link [patorjk's ASCII Art Generator](http://patorjk.com/software/taag/#p=testall&f=PsY2&t=AI%20powered%20CLI%0A)
 */
export declare const banner: (dirname?: string) => Promise<string>;
/**
 * Recursively scans the provided folder path and dynamically imports all JavaScript modules found.
 *
 * @param folderPath - The absolute path of the folder to scan.
 * @returns A Promise resolving to an array of all imported modules.
 */
export declare const scanFolderAndImportPackage: (folderPath: string) => Promise<any[]>;
/**
 * Expands the tilde (~) character in a file path to the user's home directory.
 *
 * @param filePath - The file path to expand.
 * @returns The expanded file path with the tilde replaced by the home directory.
 */
export declare const expandTilde: (filePath: string) => string;
/**
 * Runs a shell command and returns the output.
 *
 * @param cmd - The command to run.
 * @param ctx - Optional execution context for logging output.
 * @returns Promise resolving to the command output string.
 */
export declare const runCommand: (cmd: string, ctx?: ExecutionContext) => Promise<string>;
export declare class CopilotCliAgentExecutor {
    static create(commandModules: any[], execContext?: ExecutionContext): Promise<CopilotCliAgentExecutor>;
    private agent;
    private mainPromptTemplate;
    private constructor();
    run(input: string): Promise<string>;
}
export {};
