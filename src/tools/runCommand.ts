import { tool } from "@langchain/core/tools";
import { spawn } from "child_process";
import z from "zod";

const runCommand = async (props: { command: string; workingDirectory?: string }) => {
	const { command, workingDirectory } = props;

	const cwd = workingDirectory || process.cwd();

	if (!command) {
		console.error("用法: tsx src/tools/runCommand.ts <command> [args...]");
		return `执行命令失败，未提供命令`;
	}

	console.log(`[工具调用] 正在执行命令: ${command}`);

	return new Promise((resolve, reject) => {
		const [_cmd, ...args] = command.split(" ");

		const child = spawn(_cmd, args, { cwd, stdio: "inherit", shell: true });

		child.on("close", (code) => {
			if (code === 0) {
				const cwdInfo = workingDirectory
					? `\n\n重要提示：命令在目录 "${workingDirectory}" 中执行成功。如果需要在这个项目目录中继续执行命令，请使用 workingDirectory: "${workingDirectory}" 参数，不要使用 cd 命令。`
					: "";
				resolve(`命令执行成功: ${command}${cwdInfo}`);
				return;
			}

			console.log(`子进程退出，退出码 ${code}`);
			reject(`子进程退出，退出码 ${code}`);
		});

		child.on("error", (err) => {
			console.error(`执行命令时发生错误: ${err}`);
			reject(`执行命令时发生错误: ${err}`);
		});
	});
};

const toolDesc = {
	name: "runCommand",
	description:
		"执行命令行指令，输入要执行的命令和工作目录（可选），输出命令执行结果。命令将在指定的工作目录中执行，如果未指定，默认为执行命令的目录。",
	schema: z.object({
		command: z.string().describe("要执行的命令行指令"),
		workingDirectory: z.string().optional().describe("命令执行的工作目录，默认为执行命令的目录"),
	}),
};

export const runCommandTool = tool(runCommand, toolDesc);
