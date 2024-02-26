import { CreateOpenAIFunctionsAgentParams } from "langchain/agents";
import { Runnable } from "@langchain/core/runnables";
export declare function initializeToolAgentExecutor(options: CreateOpenAIFunctionsAgentParams): Promise<Runnable>;
