import { StructuredTool } from 'langchain/tools';
import { z } from 'zod';
export type LogType = 'info' | 'warn' | 'error';
/**
 * Interface for execution context passed to command tools.
 * Provides logging and progress tracking capabilities.
*/
export interface ExecutionContext {
    readonly history: CommandHistory;
    verbose: boolean;
    setProgress(message?: string): void;
    log(message: string, attr?: LogType): void;
}
export declare class CommandHistory {
    #private;
    push(cmd: string): CommandHistory;
    moveBack(): CommandHistory;
    moveNext(): CommandHistory;
    moveLast(): CommandHistory;
    get isLast(): boolean;
    get current(): string | undefined;
    get isEmpty(): boolean;
    [Symbol.iterator](): Generator<string, void, unknown>;
}
/**
 * Abstract base class for command tools. Extends StructuredTool and adds an optional ExecutionContext property.
 *
 * Command tools represent CLI commands that can be executed. They define a schema for their inputs and implement the
 * _call method to handle execution. The ExecutionContext allows them to access logging and other context services.
*/
export declare abstract class CommandTool<T extends z.ZodObject<any, any, any, any>> extends StructuredTool<T> {
    protected execContext?: ExecutionContext;
    constructor();
    setExecutionContext(execContext?: ExecutionContext): void;
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
export declare const scanFolderAndImportPackage: (folderPath: string) => Promise<CommandTool<any>[]>;
/**
 * Expands the tilde (~) character in a file path to the user's home directory.
 *
 * @param filePath - The file path to expand.
 * @returns The expanded file path with the tilde replaced by the home directory.
 */
export declare const expandTilde: (filePath: string) => string;
export type RunCommandArg = {
    cmd: string;
    out?: string;
    err?: string;
};
/**
 * Runs a shell command and returns the output.
 *
 * @param cmd - The command to run.
 * @param ctx - Optional execution context for logging output.
 * @returns Promise resolving to the command output string.
 */
export declare const runCommand: (arg: RunCommandArg | string, ctx?: ExecutionContext) => Promise<string>;
export declare class CopilotCliAgentExecutor {
    static create(commandModules: StructuredTool[], execContext?: ExecutionContext): Promise<CopilotCliAgentExecutor>;
    private agent;
    private mainPromptTemplate;
    private constructor();
    run(input: string): Promise<string>;
}
