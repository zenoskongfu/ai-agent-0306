import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import { readFilesTool } from "./tools/readFiles.js";
import { AIMessageChunk, BaseMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

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

const handleToolsCall = async (response: AIMessageChunk) => {
	// 如果响应中包含工具调用，则执行工具并将结果添加到消息中，然后继续获取响应，直到没有工具调用为止
	while (response?.tool_calls && response?.tool_calls?.length) {
		// 获取调用的工具和参数
		const toolCalls = response?.tool_calls || [];
		const toolMessages = await Promise.all(
			toolCalls.map(async (call) => {
				console.log(`调用了工具: ${call.name}`);
				console.log(`参数: ${JSON.stringify(call.args)}`);

				const tool = tools.find((tool) => tool.name === call.name);

				if (!tool) {
					return new ToolMessage({
						content: `未找到工具: ${call.name}`,
						tool_call_id: call.id ?? "",
					});
				}

				const result = await tool.invoke(call);
				console.log(`工具 ${call.name} 的结果: ${result}`);
				if (result instanceof ToolMessage) {
					return result;
				}
				return new ToolMessage({
					content: typeof result === "string" ? result : JSON.stringify(result),
					tool_call_id: call.id ?? "",
				});
			}),
		);

		// 将工具结果添加到响应中
		message.push(...toolMessages);

		response = await chatWithTools.invoke(message);
		message.push(response);
	}

	return response;
};

response = await handleToolsCall(response);

console.log(response?.content);
