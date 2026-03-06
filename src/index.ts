import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import { readFilesTool } from "./tools/readFiles.js";
import { handleToolsCall } from "./utils/handleTools.js";

configDotenv();

const chat = new ChatOpenAI({
	model: "qwen3-coder-flash",
	temperature: 0.9,
	configuration: {
		apiKey: process.env.ALI_YUN_AI_API_KEY,
		baseURL: process.env.ALI_YUN_AI_API_BASE_URL,
	},
});

const tools = [readFilesTool];

const chatWithTools = chat.bindTools(tools);

const message = [
	new SystemMessage("你是一个人工智能助手，能够使用工具来帮助用户完成任务。"),
	// 提问路径，一般相对于workspace Root目录, 而workspace Root目录一般是执行命令的目录
	new HumanMessage("读取文件 src/test.txt 的内容, 并进行过度解读，不超过30字"),
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
