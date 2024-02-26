import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "langchain/schema";
import 'dotenv/config'

const main = async () => {

    const extractionFunctionSchema = {
        name: "extractor",
        description: "Extracts fields from the input.",
        parameters: {
          type: "object",
          properties: {
            tone: {
              type: "string",
              enum: ["positive", "negative"],
              description: "The overall tone of the input",
            },
            word_count: {
              type: "number",
              description: "The number of words in the input",
            },
            chat_response: {
              type: "string",
              description: "A response to the human's input",
            },
          },
          required: ["tone", "word_count", "chat_response"],
        },
      };
      
    const model = new ChatOpenAI({
        modelName: "gpt-4",
      }).bind({
        functions: [extractionFunctionSchema],
        function_call: { name: "extractor" },
      });
      
    const result = await model.invoke([
        new HumanMessage("What a beautiful day!"),
        new HumanMessage("such bad day!")
    ]);
      
    console.log(result);
}

main();
