import fs from "fs/promises";
import z from "zod";
import { tool } from "@langchain/core/tools";
import { resolve } from "path";

async function exists(path: string) {
	try {
		await fs.stat(path);
		return true;
	} catch (e: any) {
		if (e.code === "ENOENT") return false; // 不存在
		throw e; // 其他错误（如 EACCES）
	}
}

// read files
const readFiles = async ({ filePath }: { filePath: string }) => {
	try {
		console.log("[工具调用] 正在读取文件:", filePath);
		const fullPath = resolve(process.cwd(), filePath);
		// 判断文件是否存在
		if (!(await exists(fullPath))) {
			return `文件 ${fullPath} 不存在`;
		}
		// 判断是否是文件
		if (!(await fs.stat(fullPath)).isFile()) {
			return `${fullPath} 不是一个文件`;
		}

		// 读取文件内容
		const content = await fs.readFile(fullPath, "utf-8");
		return content;
	} catch (error) {
		return `读取文件 ${filePath} 时发生错误: ${error}`;
	}
};

const readFilesToolDesc = {
	name: "readFiles",
	description: "读取文件内容，输入文件路径，输出文件内容。支持相对路径和绝对路径。",
	schema: z.object({
		filePath: z.string().describe("要读取的文件路径"),
	}),
};

export const readFilesTool = tool(readFiles, readFilesToolDesc);
