import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
configDotenv();
const chat = new ChatOpenAI({
    model: "qwen3-coder-flash",
    configuration: {
        apiKey: process.env.ALI_YUN_AI_API_KEY,
        baseURL: process.env.ALI_YUN_AI_API_BASE_URL,
    },
});
const response = await chat.invoke("介绍你自己");
console.log(response);
