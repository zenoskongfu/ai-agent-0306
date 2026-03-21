import { config as configDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(currentFilePath);
const rootDir = path.resolve(__dirname, "..");

configDotenv({
	path: path.join(rootDir, ".env"),
});

export const getEnv = () => {
	return {
		ALI_YUN_AI_API_KEY: process.env.ALI_YUN_AI_API_KEY,
		ALI_YUN_AI_API_BASE_URL: process.env.ALI_YUN_AI_API_BASE_URL,
		ALI_YUN_MODEL: process.env.ALI_YUN_MODEL,
		BASE_DIR: process.cwd(),
		ROOT_DIR: rootDir,
		SRC_DIR: path.resolve(__dirname, "../src"),
	};
};
