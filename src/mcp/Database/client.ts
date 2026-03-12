import { MultiServerMCPClient } from "@langchain/mcp-adapters";

export const databaseMcpClient = new MultiServerMCPClient({
	mcpServers: {
		"my-database-server": {
			command: "npx",
			args: ["tsx", "/Users/chengtongxue/Project/_AI/ai-agent-0306/src/mcp/Database/server.ts"],
		},
	},
});
