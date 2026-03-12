import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const getClientResource = async (client: MultiServerMCPClient) => {
	const lists = await client.listResources();

	let content = "";

	for (const [name, resource] of Object.entries(lists)) {
		for (const item of resource) {
			const _content = await client.readResource(name, item.uri);
			content += `- ${name}: ${_content.map((i) => i.text).join(", ")}\n`;
		}
	}

	return content;
};

export { getClientResource };
