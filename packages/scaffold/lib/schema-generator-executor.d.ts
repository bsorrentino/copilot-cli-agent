import { CreateOpenAIFunctionsAgentParams } from "langchain/agents";
import { Runnable } from "@langchain/core/runnables";
export declare function schemaGeneratorAgentExecutor({ llm }: Pick<CreateOpenAIFunctionsAgentParams, "llm">): Promise<Runnable>;
