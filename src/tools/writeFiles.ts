import { tool } from "@langchain/core/tools";
import { mkdir, stat, writeFile } from "fs/promises";
import path from "path";
import z from "zod";

const writeFiles = async ({ filePath, content }: { filePath: string; content: string }) => {
	try {
		console.log(`[工具调用] 正在写入文件: ${filePath}`);
		// 创建文件路径对应的目录
		const dir = path.dirname(filePath);
		if (!(await stat(dir))) {
			await mkdir(dir, { recursive: true });
		}
		// 写入文件
		writeFile(filePath, content, "utf-8");

		console.log(`文件 ${filePath} 已成功写入`);

		return `文件 ${filePath} 已成功写入`;
	} catch (error) {
		console.error(`写入文件 ${filePath} 时发生错误:`, error);
		return `写入文件 ${filePath} 时发生错误: ${error}`;
	}
};

const toolDesc = {
	name: "writeFiles",
	description: "写入文件内容，输入文件路径和内容，输出写入结果。支持相对路径和绝对路径。",
	schema: z.object({
		filePath: z.string().describe("要写入的文件路径"),
		content: z.string().describe("要写入文件的内容"),
	}),
};

export const writeFilesTool = tool(writeFiles, toolDesc);
