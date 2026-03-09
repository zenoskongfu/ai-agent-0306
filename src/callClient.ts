import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import { databaseMcpClient } from "./mcp/Database/client.js";
import { handleToolsCall } from "./utils/index.js";

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

// const tools = [readFilesTool, listDirTool, writeFilesTool, runCommandTool] as DynamicStructuredTool[];

const tools = await databaseMcpClient.getTools();

const chatWithTools = chat.bindTools(tools);

const runAgentWithTools = async (query: string, maxRetries = 30) => {
	const message = [
		new SystemMessage(`
		你是一个人工智能助手，能够使用工具来帮助用户完成任务。
		
		当前工作目录：${process.cwd()}

		你可以使用以下工具：
		${tools.map((tool) => `- ${tool.name}: ${tool.description}，参数格式: ${JSON.stringify(tool.description)}`).join("\n")}
		`),
		// 提问路径，一般相对于workspace Root目录, 而workspace Root目录一般是执行命令的目录
		new HumanMessage(query),
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
};

const case1 = `
  先帮我看下有哪些tools，帮我看下用户ID为1的用户信息和购物车信息。
`;

runAgentWithTools(case1);
