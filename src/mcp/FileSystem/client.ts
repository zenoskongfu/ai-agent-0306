import { MultiServerMCPClient } from "@langchain/mcp-adapters";

export const getFileSystemMcpClient = (allowedDirs: string[]) => {
	return new MultiServerMCPClient({
		mcpServers: {
			filesystem: {
				command: "npx",
				args: ["-y", "@modelcontextprotocol/server-filesystem", allowedDirs.join(",")],
			},
		},
	});
};
