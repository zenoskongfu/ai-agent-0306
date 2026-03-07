import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import { listDirTool, readFilesTool, runCommandTool, writeFilesTool } from "./tools/index.js";
import { handleToolsCall } from "./utils/index.js";
import { DynamicStructuredTool } from "@langchain/core/tools";

configDotenv();

const chat = new ChatOpenAI({
	model: "qwen3-coder-flash",
	temperature: 0,
	configuration: {
		apiKey: process.env.ALI_YUN_AI_API_KEY,
		baseURL: process.env.ALI_YUN_AI_API_BASE_URL,
	},
});

const tools = [readFilesTool, listDirTool, writeFilesTool, runCommandTool] as DynamicStructuredTool[];

const chatWithTools = chat.bindTools(tools);

const runAgentWithTools = async (query: string, maxRetries = 30) => {
	const message = [
		new SystemMessage(`
		你是一个人工智能助手，能够使用工具来帮助用户完成任务。
		
		当前工作目录：${process.cwd()}

		你可以使用以下工具：
		${tools.map((tool) => `- ${tool.name}: ${tool.description}，参数格式: ${JSON.stringify(tool.description)}`).join("\n")}

			不要使用cd命令来切换目录，如果需要在特定目录下执行命令，请使用工具runCommand，并传入workingDirectory参数来指定目录。

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

const case1 = `创建一个功能丰富的 React TodoList 应用：

1. 在src/project目录下创建项目：echo -e "n\nn" | pnpm create vite react-todo-app --template react-ts
2. 修改 src/App.tsx，实现完整功能的 TodoList：
 - 添加、删除、编辑、标记完成
 - 分类筛选（全部/进行中/已完成）
 - 统计信息显示
 - localStorage 数据持久化
3. 添加复杂样式：
 - 渐变背景（蓝到紫）
 - 卡片阴影、圆角
 - 悬停效果
4. 添加动画：
 - 添加/删除时的过渡动画
 - 使用 CSS transitions
5. 列出目录确认

注意：使用 pnpm，功能要完整，样式要美观，要有动画效果

之后在 react-todo-app 项目中：
1. 使用 pnpm install 安装依赖
2. 使用 pnpm run dev 启动服务器
`;

runAgentWithTools(case1);
