import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import { listDirTool, readFilesTool, runCommandTool, writeFilesTool } from "./tools/index.js";
import { handleToolsCall } from "./utils/index.js";
import { DynamicStructuredTool } from "@langchain/core/tools";

configDotenv();

const chat = new ChatOpenAI({
	model: "qwen3-coder-flash",
	temperature: 0.9,
	configuration: {
		apiKey: process.env.ALI_YUN_AI_API_KEY,
		baseURL: process.env.ALI_YUN_AI_API_BASE_URL,
	},
});

const tools = [readFilesTool, listDirTool, writeFilesTool, runCommandTool] as DynamicStructuredTool[];

const chatWithTools = chat.bindTools(tools);

const message = [
	new SystemMessage("你是一个人工智能助手，能够使用工具来帮助用户完成任务。"),
	// 提问路径，一般相对于workspace Root目录, 而workspace Root目录一般是执行命令的目录
	new HumanMessage("帮我看看src/tools目录下都有什么文件？如果有index.ts文件，帮我看看这个文件的内容。"),
] as BaseMessage[];

// 获取响应
let response = await chatWithTools.invoke(message);
message.push(response);

response = await handleToolsCall({
	client: chatWithTools,
	message,
	tools,
	response: response,
});

console.log(response?.content);
