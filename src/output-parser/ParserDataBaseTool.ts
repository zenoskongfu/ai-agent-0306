import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { config as configDotenv } from "dotenv";
import z from "zod";

/**
 * 使用tool的参数来结构化模型的输出
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

const zodSchema = z.object({
	name: z.string().describe("科学家的全名"),
	birth_year: z.number().describe("出生年份"),
	death_year: z.number().optional().describe("去世年份，如果还在世则不填"),
	nationality: z.string().describe("国籍"),
	fields: z.array(z.string()).describe("研究领域列表"),
});

// const tools = [
// 	{
// 		name: "parse_scientist_info",
// 		description: "用来解析科学家信息的工具 ",
// 		schema: zodSchema,
// 	},
// ];

// const chatWithTools = chat.bindTools(tools);

const messages = [
	new SystemMessage(`你是一个人工智能助手。你可以使用工具来帮助用户完成任务。`),
	new HumanMessage(
		`请介绍一下爱因斯坦，不要超过100个字。请严格提取 name、birth_year、death_year、nationality、fields 这些字段。birth_year 必须是数字，fields 必须是字符串数组。`,
	),
];

// 直接使用模型的结构化输出功能
const chatWithModel = chat.withStructuredOutput(zodSchema, {
	method: "functionCalling",
	includeRaw: true,
});

const response = await chatWithModel.invoke(messages);

console.log("Response: \n", response);
console.log("Raw response: \n", response.raw);
console.log("Parsed response: \n", response.parsed);
// console.log("Parsing error: \n", response.parsing_error);
