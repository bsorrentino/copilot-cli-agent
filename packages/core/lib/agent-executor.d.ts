import { CreateOpenAIFunctionsAgentParams } from "langchain/agents";
import { Pregel } from "@langchain/langgraph/pregel";
export declare function initializeCLIAgentExecutor(options: Pick<CreateOpenAIFunctionsAgentParams, "llm" | "tools">): Promise<Pregel>;
