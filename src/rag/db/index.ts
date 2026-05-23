import { DataType, ErrorCode, IndexType, MetricType, MilvusClient } from "@zilliz/milvus2-sdk-node";
import { COLLECTION_NAME, DEFAULT_EMBEDDING_DIM, PAGE_CONTENT_MAX_LENGTH, SOURCE_MAX_LENGTH } from "./const.js";

const client = new MilvusClient({
	address: "localhost:19530",
});

let isInitialDB = false;

const initialDB = async () => {
	if (!isInitialDB) {
		console.log("Connecting to Milvus server...");
		isInitialDB = true;
		await client.connectPromise;
		console.log("Connected to Milvus server.");
	}
	return client;
};

const closeDB = async () => {
	if (!isInitialDB) {
		return;
	}

	await client.closeConnection();
	isInitialDB = false;
};

const createCollection = async (collectionName: string, embeddingDim = DEFAULT_EMBEDDING_DIM) => {
	if (!Number.isInteger(embeddingDim) || embeddingDim <= 0) {
		throw new Error(`Invalid embedding dim: ${embeddingDim}`);
	}

	// await initialDB();

	console.log("check collection is exist?");
	const hasCollectionRes = await client.hasCollection({
		collection_name: collectionName,
	});

	if (hasCollectionRes.value) {
		console.log(`collection ${collectionName} already exists`);
		return hasCollectionRes;
	}

	console.log("create collection");

	try {
		const createCollectionRes = await client.createCollection({
			collection_name: collectionName,
			description: "Parsed documents from src/rag/documents.json",
			enable_dynamic_field: true,
			fields: [
				{
					name: "id",
					data_type: DataType.Int64,
					is_primary_key: true,
					autoID: true,
					description: "Primary key",
				},
				{
					name: "pageContent",
					data_type: DataType.VarChar,
					max_length: PAGE_CONTENT_MAX_LENGTH,
					description: "Document text content",
				},
				{
					name: "source",
					data_type: DataType.VarChar,
					max_length: SOURCE_MAX_LENGTH,
					description: "PDF source path",
				},
				{
					name: "pageNumber",
					data_type: DataType.Int64,
					description: "Current page number",
				},
				{
					name: "totalPages",
					data_type: DataType.Int64,
					description: "Total PDF page count",
				},
				{
					name: "metadata",
					data_type: DataType.JSON,
					description: "Original metadata object from documents.json",
				},
				{
					name: "embedding",
					data_type: DataType.FloatVector,
					dim: embeddingDim,
					description: "Embedding vector of pageContent",
				},
			],
			index_params: [
				{
					field_name: "embedding",
					index_type: IndexType.AUTOINDEX,
					metric_type: MetricType.COSINE,
				},
			],
		});

		if (createCollectionRes.error_code !== ErrorCode.SUCCESS) {
			throw new Error(createCollectionRes.reason || "Failed to create collection");
		}

		return createCollectionRes;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const searchPdfDb = async (embedding: number[]) => {
	const client = await initialDB();
	try {
		return client.search({
			collection_name: COLLECTION_NAME,
			vector: embedding,
			limit: 2,
			metric_type: MetricType.COSINE,
			output_fields: ["id", "pageContent", "source", "pageNumber", "totalPages"],
		});
	} catch (error) {
		return null;
	}
};

export { client, initialDB, closeDB, createCollection, searchPdfDb };
