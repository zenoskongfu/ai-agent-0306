import { MultiServerMCPClient } from "@langchain/mcp-adapters";

export const databaseMcpClient = new MultiServerMCPClient({
	mcpServers: {
		"my-database-server": {
			command: "node",
			args: ["/Users/chengtongxue/Project/_AI/ai-agent-0306/dist/mcp/server/Database/server.js"],
		},
	},
});
