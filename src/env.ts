import { config as configDotenv } from "dotenv";
import path from "node:path";

configDotenv();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const getEnv = () => {
	return {
		apiKey: process.env.ALI_YUN_AI_API_KEY,
		baseURL: process.env.ALI_YUN_AI_API_BASE_URL,
		model: process.env.ALI_YUN_AI_API_MODEL,
		rootDir: path.resolve(__dirname, "./"),
		srcDir: path.resolve(__dirname, "./src"),
	};
};

export const globalEnv = getEnv();
