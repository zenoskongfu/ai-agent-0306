import { AIMessageChunk, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";

export const handleToolsCall = async (props: {
	response: AIMessageChunk;
	client: Runnable;
	message: BaseMessage[];
	tools: DynamicStructuredTool[];
}) => {
	const { client, message, tools } = props;
	let response = props.response;

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
				console.log(`调用工具 ${call.name} 的结束`);
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

		response = await client.invoke(message);
		message.push(response);
	}

	return response;
};
