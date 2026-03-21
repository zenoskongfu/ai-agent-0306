import { ChatOpenAI } from "@langchain/openai";
import { getEnv } from "../env.js";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getClientResource } from "./getClientResource.js";
import { handleToolsCall } from "./handleTools.js";

const env = getEnv();

export const queryAI = async (query: string, mcpClient: MultiServerMCPClient) => {
	//创建大模型
	const chat = new ChatOpenAI({
		model: env.ALI_YUN_MODEL,
		temperature: 0,
		configuration: {
			apiKey: env.ALI_YUN_AI_API_KEY,
			baseURL: env.ALI_YUN_AI_API_BASE_URL,
		},
	});

	// 绑定tools
	const chatWithTools = chat.bindTools(await mcpClient.getTools());

	// 构造消息
	const message = [
		new SystemMessage(`
      你是一个人工智能助手，能够使用工具来帮助用户完成任务。
      
      当前工作目录：${process.cwd()}

      你可以使用以下工具：
      ${await getClientResource(mcpClient)}
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
		tools: await mcpClient.getTools(),
		response: response,
	});

	console.log(response?.content);
	return response?.content;
};
