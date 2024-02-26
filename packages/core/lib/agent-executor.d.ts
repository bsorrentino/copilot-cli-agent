import { CreateOpenAIFunctionsAgentParams } from "langchain/agents";
import { Runnable } from "@langchain/core/runnables";
export declare function initializeCLIAgentExecutor(options: Pick<CreateOpenAIFunctionsAgentParams, "llm" | "tools">): Promise<Runnable<{
    input: string;
}>>;
