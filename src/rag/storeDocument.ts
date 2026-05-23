import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { globalEnv } from "../env.js";
import CustomPDFLoader from "./PDFLoader.js";
import path from "node:path";
import { createCollection, initialDB } from "./db/index.js";
import { COLLECTION_NAME, EMBEDDING_DIM } from "./db/const.js";

const insertData = async (embeddings: OpenAIEmbeddings) => {
	async function getEmbedding(text: string) {
		const result = await embeddings.embedQuery(text);
		return result;
	}

	// 准备PDF loader
	const loader = new CustomPDFLoader(path.resolve(globalEnv.srcDir, "./rag/va.pdf"), {
		splitPages: true,
		contextWindow: 30,
	});
	// 准备Milvus client
	const milvusClient = await initialDB();
	// 准备Milvus collection
	await createCollection(COLLECTION_NAME, EMBEDDING_DIM);

	// 准备Milvus data
	const documents = await loader.load();
	const datas = await Promise.all(
		documents.map(async (doc) => {
			return {
				pageContent: doc.pageContent,
				metadata: doc.metadata,
				source: doc.metadata.source,
				pageNumber: doc.metadata.custom.pageNumber,
				totalPages: doc.metadata.custom.totalPages,
				embedding: await getEmbedding(doc.pageContent),
			};
		}),
	);

	// 插入数据
	const result = await milvusClient.insert({
		collection_name: COLLECTION_NAME,
		data: datas,
	});
	return result;
};

const storeDocument = async () => {
	// 准备embedding
	const embeddings = new OpenAIEmbeddings({
		apiKey: globalEnv.apiKey,
		model: globalEnv.embeddingModel,
		batchSize: 10, // 一次发送几段请求
		configuration: {
			baseURL: globalEnv.baseURL,
		},
		dimensions: EMBEDDING_DIM,
	});

	const result = await insertData(embeddings);

	console.log("insert result", result.insert_cnt);
};

storeDocument();
