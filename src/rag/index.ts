import { ta } from "zod/locales";
import { globalEnv } from "../env.js";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import "cheerio";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import CustomPDFLoader from "./PDFLoader.js";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const chat = new ChatOpenAI({
	model: globalEnv.model,
	temperature: 0,
	configuration: {
		apiKey: globalEnv.apiKey,
		baseURL: globalEnv.baseURL,
	},
});

const embeddings = new OpenAIEmbeddings({
	apiKey: globalEnv.apiKey,
	model: globalEnv.embeddingModel,
	batchSize: 10,
	configuration: {
		baseURL: globalEnv.baseURL,
	},
});

// loader 解析PDF
const loader = new CustomPDFLoader(path.resolve(globalEnv.srcDir, "./rag/va.pdf"), {
	splitPages: true,
	contextWindow: 30,
});

const documents = await loader.load();

// 视情况区分文本片段的粒度，过大可能导致检索不出相关内容，过小可能导致上下文缺失
const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 300,
	chunkOverlap: 40,
	separators: ["。", "!", "?", "...", " "],
});

const splittedDocument = await splitter.splitDocuments(documents);

// console.log(documentSplitter);

// 将拆分的文档，存入向量内村中
const vectorStore = await MemoryVectorStore.fromDocuments(splittedDocument, embeddings);

// 找到最相关的文档，相关系数2
// const retriever = vectorStore.asRetriever({ k: 2 });

// 准备message
const questions = ["有几个主角，他们之间是什么关系"];

// 将query向量化,然后找到最相近的文档. 直接在store中查找
const retrievedResult = await vectorStore.similaritySearchWithScore(questions[0], 2);

// 输出对应的文档

const contents = retrievedResult.map((result) => {
	// console.log(result[0].pageContent);
	return result[0].pageContent;
});

// 检索相似的文本片段

// 将文本片段和query一起发送给模型，生成答案
const messages = [
	new SystemMessage(`
		你是一个老师，你会讲故事回答学生的问题， 语气会人性化，偏口语：
		
		上下文： ${contents.join("\n\n\n")}
		`),
	new HumanMessage(questions[0]),
];

// 输出答案
const response = await chat.invoke(messages);

console.log(response.content);
