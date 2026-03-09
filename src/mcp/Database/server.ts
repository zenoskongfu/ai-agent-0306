import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { findCartByUserId, findUserById } from "./tools.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const mcpServer = new McpServer({
	// 这里可以添加一些配置项，例如端口号、日志级别等
	name: "my-database-server",
	version: "1.0.0",
});

// /往mcpServer放一个tool
mcpServer.registerTool(
	"query-user-by-id",
	{
		description: "根据用户ID查询用户信息",
		// 参数结构
		inputSchema: {
			userId: z.string().describe("用户ID"),
		},
	},
	({ userId }) => {
		return {
			content: [{ type: "text", text: findUserById(userId) }],
		};
	},
);

// id查询用户信息，输出用户自己的购物车信息
mcpServer.registerTool(
	"query-cart-by-user-id",
	{
		description: "根据用户ID查询用户的购物车信息",
		// 参数结构
		inputSchema: {
			userId: z.string().describe("用户ID"),
		},
	},
	({ userId }) => {
		return {
			content: [{ type: "text", text: findCartByUserId(userId) }],
		};
	},
);

mcpServer.registerResource(
	"使用指南",
	"docs://guide",
	{
		description: "这是一个使用指南资源，包含了如何使用这个数据库服务器的详细说明。",
		mimeType: "text/plain",
	},
	async () => {
		return {
			contents: [
				{
					uri: "docs://guide",
					mimeType: "text/plain",
					type: "text",
					text: `欢迎使用数据库服务器！这是一个简单的示例，展示了如何根据用户ID查询用户信息。您可以调用工具 "query-user-by-id" 并传入一个用户ID来获取相应的用户信息。例如：

                工具名称: query-user-by-id
                输入参数: { "userId": "1" }

                这将返回用户ID为1的用户信息。您可以尝试不同的用户ID来查询其他用户的信息。
								同样的，您也可以调用工具 "query-cart-by-user-id" 来查询用户的购物车信息。例如：

								工具名称: query-cart-by-user-id
								输入参数: { "userId": "1" }
										`,
				},
			],
		};
	},
);

const transport = new StdioServerTransport();

await mcpServer.connect(transport);
