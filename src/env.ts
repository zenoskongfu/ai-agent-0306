import { config as configDotenv } from "dotenv";
import path from "node:path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

configDotenv({ path: path.resolve(__dirname, "../.env") });

const getFirstDefinedEnv = (...keys: string[]) => {
	for (const key of keys) {
		const value = process.env[key];
		if (typeof value === "string" && value.trim() !== "") {
			return value;
		}
	}

	return undefined;
};

const requireEnv = (...keys: string[]) => {
	const value = getFirstDefinedEnv(...keys);

	if (!value) {
		throw new Error(`Missing required environment variable: ${keys.join(" | ")}`);
	}

	return value;
};

export const getEnv = () => {
	return {
		apiKey: requireEnv("ALI_YUN_AI_API_KEY"),
		baseURL: requireEnv("ALI_YUN_AI_API_BASE_URL"),
		model: requireEnv("ALI_YUN_AI_API_MODEL", "ALI_YUN_MODEL"),
		embeddingModel: requireEnv("ALI_YUN_EMBEDDING_MODEL"),
		rootDir: path.resolve(__dirname, "../"),
		srcDir: path.resolve(__dirname, "."),
	} as const;
};

export const globalEnv = getEnv();
