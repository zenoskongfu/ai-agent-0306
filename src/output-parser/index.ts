import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import { z } from "zod";

/**
 * 使用 StructureOutputParser 来解析模型输出为结构化数据
 * 1. 定义输出格式
 * 2. 将输出格式的说明传递给模型
 * 3. 解析模型输出为结构化数据
 */
configDotenv();

const chat = new ChatOpenAI({
	model: process.env.ALI_YUN_MODEL,
	temperature: 0,
	configuration: {
		apiKey: process.env.ALI_YUN_AI_API_KEY,
		baseURL: process.env.ALI_YUN_AI_API_BASE_URL,
	},
});

// const parser = StructuredOutputParser.fromNamesAndDescriptions({
// 	name: "姓名",
// 	birth_year: "出生年份",
// 	nationality: "国籍",
// 	major_achievements: "主要成就，用逗号分隔的字符串",
// 	famous_theory: "著名理论",
// });

const zodSchema = z.object({
	name: z.string().describe("科学家的全名"),
	birth_year: z.number().describe("出生年份"),
	death_year: z.number().optional().describe("去世年份，如果还在世则不填"),
	nationality: z.string().describe("国籍"),
	fields: z.array(z.string()).describe("研究领域列表"),
});

const parser = StructuredOutputParser.fromZodSchema(zodSchema);

const messages = [
	new SystemMessage(`n你是一个人工智能助手，能够使用工具来帮助用户完成任务。
   `),
	new HumanMessage(`介绍一下爱因斯坦, 不要超过100个字. ${parser.getFormatInstructions()}`),
];

// const stream = await chat.stream(messages);

// let content = "";
// let length = 0;
// try {
// 	for await (const response of stream) {
// 		content += response.content;
// 		process.stdout.write((response?.content as string) || "");
// 	}
// } catch (error) {}

const response = await chat.invoke(messages);

console.log("Raw response: \n", response?.content);

const result = await parser.parse(`\`\`\`${response.content as string}\`\`\``);

// 已经是json格式的
console.log(result);

try {
	console.log(JSON.parse(response.content as string));
} catch (error) {
	console.error("Error parsing JSON:", error);
}
