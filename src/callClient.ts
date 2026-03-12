import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import { databaseMcpClient } from "./mcp/Database/client.js";
import { handleToolsCall, getClientResource } from "./utils/index.js";

configDotenv();

// 写AI Agent的框架

const chat = new ChatOpenAI({
	model: "qwen3-coder-flash",
	temperature: 0,
	configuration: {
		apiKey: process.env.ALI_YUN_AI_API_KEY,
		baseURL: process.env.ALI_YUN_AI_API_BASE_URL,
	},
});

const tools = await databaseMcpClient.getTools();

const chatWithTools = chat.bindTools(tools);

const runAgentWithTools = async (query: string, maxRetries = 30) => {
	const message = [
		new SystemMessage(`
		你是一个人工智能助手，能够使用工具来帮助用户完成任务。
		
		当前工作目录：${process.cwd()}

    当前可用的资源有：\n
		${await getClientResource(databaseMcpClient)}
		`),
		new HumanMessage(query),
	] as BaseMessage[];

	console.log(message[0].content);

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
};

const case1 = `
  先帮我看下有哪些tools。然后帮我看下用户ID为1的用户信息和购物车信息
`;

await runAgentWithTools(case1);

databaseMcpClient.close();
