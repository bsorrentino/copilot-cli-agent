
Enhance your CLI with AI

Potential of AI

Imagine having an AI-powered Command Line Interface (CLI) that can enhance your productivity and make your life easier. With the power of LLM models like GPT 3.5/4, you can simply ask for the right command line for any task, and the AI will provide the appropriate commands for your operating system.

For example, you could ask the AI, 'What is the command to create a new directory?' and it will instantly give you the correct command, be it 'mkdir' for Linux or 'mkdir' for Windows.

from Idea…

This idea revolves around leveraging the capabilities of OpenAI and its powerful function calling features. By integrating AI into the CLI, you can streamline your workflow and save time and effort by quickly obtaining the right commands without extensive manual searching or trial-and-error.

But we can do more, we can add custom commands that  further extends your CLI enabling the possibility to create very complex workflow in easy way  especially because we use the natural language processing to achieve this

to Solution 

I adopted Langchain Framework and its OpenAI Functions Agent to develop the solution.

A Briefly Langchain overview

LangChain is an effective framework for building apps utilising language models. It facilitates development through standardised components and abstractions  which enables the app to become data-aware and allows the language model to interact with its environment.

A Langchain key concept : the Agent

In particular an agent is a key component that has access to a suite of tools. It is responsible for making decisions based on user input and using ReACT framework it determine which tools to utilise within the application. 

The OpenAI Function Agent

The Agent utilizes GPT 3/4's ability to comprehend required function calls, producing necessary inputs and retaining past conversations for appropriate responses.

_TO BE CONTINUE ..._