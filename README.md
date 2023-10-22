

# Enhance your CLI with AI
This project serves as a proof of concept.

## Introduction
Discover the potential of integrating AI into your Command Line Interface (CLI) to supercharge your productivity. With the prowess of LLM models like GPT 3.5/4, you can effortlessly fetch the right command line for any task, tailored for your operating system.

## Key Features
- **AI-Powered Command Suggestions**: Ask the AI for commands, such as listing files in a folder, and get instant, accurate responses.
- **OpenAI Function Calling**: Harness the capabilities of OpenAI to streamline your CLI workflow.
- **Custom Commands**: Extend your CLI with custom commands using natural language processing.
- **[OpenAI Functions Agent]**: Utilize GPT 3/4's function calling abilities to generate necessary inputs.

## Implementation
The solution is based on the [Langchain.js] Framework and [OpenAI Functions Agent]. By combining Langchain and [ReACT], you can create specialized tools for each command you want to integrate into your CLI. These tools understand natural language input, process it, and generate appropriate responses based on the context.

## Debugging and Monitoring
The [LangSmith] platform, part of the [LangChain] suite, allows for debugging, testing, evaluating, and monitoring chains and intelligent agents built on any LLM framework.

## Conclusion
Experience the magic of integrating AI into your CLI. With LLM models like GPT 3.5/4, you have a powerful command-line assistant. This article is just the beginning. In Part 2, we'll delve deeper into adding custom command line commands using natural language requests.

## Articles:

* Enhance your CLI with AI [(Part 1)](https://dev.to/bsorrentino/enhance-your-cli-with-ai-part-1-1ca)
[(Part 2)](https://dev.to/bsorrentino/enhance-your-cli-with-ai-part-1-16p0)

## References

* [ReACT prompint][ReACT]
* [Langchain Framework][langchain]
* [Langchain.js Agent Types](https://js.langchain.com/docs/modules/agents/agent_types/)
* [Langsmith platform][LangSmith]

[ReACT]: https://www.promptingguide.ai/techniques/react
[langchain]: https://docs.langchain.com/docs/
[langchain.js]: https://js.langchain.com/docs/get_started/introduction/
[LangSmith]: https://smith.langchain.com
[project]: https://github.com/bsorrentino/copilot-cli-agent
[OpenAI Functions Agent]: https://js.langchain.com/docs/modules/agents/agent_types/openai_functions_agent

