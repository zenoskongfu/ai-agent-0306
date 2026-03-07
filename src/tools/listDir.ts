import { tool } from "@langchain/core/tools";
import { readdir } from "fs/promises";
import path from "path";
import z from "zod";

const listDir = async (dirPath: string) => {
	try {
		console.log(`[工具调用] 正在列出目录: ${dirPath}`);
		const files = await readdir(path.join(process.cwd(), dirPath));

		console.log(`目录 ${dirPath} 中的文件和子目录有: ${files.join(", ")}`);

		return `目录 ${dirPath} 中的文件和子目录有: ${files.join(", ")}`;
	} catch (error) {
		console.error(`读取目录 ${dirPath} 时发生错误:`, error);
		return `读取目录 ${dirPath} 时发生错误: ${error}`;
	}
};

const toolDesc = {
	name: "listDir",
	description: "列出目录中的文件和子目录，输入目录路径，输出目录中的文件和子目录列表。支持相对路径和绝对路径。",
	schema: z.string().describe("要列出的目录路径"),
};

const listDirTool = tool(listDir, toolDesc);

export { listDirTool };
