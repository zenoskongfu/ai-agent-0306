import { getFileSystemMcpClient } from "../client.js";
import path from "node:path";
import { queryAI } from "../../../utils/queryAI.js";

const fileSystemClient = getFileSystemMcpClient([path.join(process.cwd(), "./")]);

export const callFileSystemClient = async (query: string) => {
	await queryAI(query, fileSystemClient);
};

await callFileSystemClient("查询一下当前有哪些文件和文件夹");

fileSystemClient.close();
