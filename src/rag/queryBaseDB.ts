import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { globalEnv } from "../env.js";
import { closeDB, searchPdfDb } from "./db/index.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const main = async () => {
	try {
		// AI client
		const AIClient = new ChatOpenAI({
			model: globalEnv.model,
			temperature: 0,
			configuration: {
				apiKey: globalEnv.apiKey,
				baseURL: globalEnv.baseURL,
			},
		});
		// embedding client
		const embeddings = new OpenAIEmbeddings({
			apiKey: globalEnv.apiKey,
			model: globalEnv.embeddingModel,
			batchSize: 10,
			configuration: {
				baseURL: globalEnv.baseURL,
			},
		});

		const getEmbedding = (text: string) => {
			return embeddings.embedQuery(text);
		};

		// 将query embedding化，然后从milvus数据库中，找到最相近的几个文案
		const query = `我知道有几个主角，分别叫什么名字？`;

		const embeddingQuery = await getEmbedding(query);

		// 从数据库中查找最相近的文案
		const result = await searchPdfDb(embeddingQuery);
		let resContent = [];
		if (result) {
			resContent = result.results.map((item) => {
				return item.pageContent;
			});

			// console.log(resContent);
		}

		// 编辑成promot发送给Ai client
		const messages = [
			new SystemMessage(`
      你是一个会讲故事来回答问题的老师。并且根据下面内容回答。
      如果不知道，就说不知道。
      
      ${resContent.join("\n")}
      `),
			new HumanMessage(query),
		];

		return await AIClient.invoke(messages);
	} finally {
		await closeDB();
	}
};

const response = await main();

console.log("系统回答： ", response.content);
