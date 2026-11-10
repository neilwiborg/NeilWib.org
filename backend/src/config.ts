import { fileURLToPath } from "node:url";
import dotenvFlow from "dotenv-flow";

const defaultRegion = "us-west-2";
const defaultPort = 3000;
const defaultLogLevel = "info";

dotenvFlow.config({
	path: fileURLToPath(new URL("../../", import.meta.url)),
});

const normalizePort = (value: string | number): number | string | false => {
	const port = Number.parseInt(String(value), 10);
	return Number.isNaN(port) ? value : port >= 0 ? port : false;
};

const publicApiPrefix = process.env.PUBLIC_API_PREFIX;
if (publicApiPrefix === undefined) {
	throw new Error("PUBLIC_API_PREFIX must be configured for the backend.");
}

export const config = {
	logLevel: process.env.LOG_LEVEL ?? defaultLogLevel,
	port: normalizePort(process.env.API_PORT ?? defaultPort),
	publicApiPrefix,
	region: process.env.AWS_REGION ?? defaultRegion,
	unsplashAccessKeySecretId: process.env.UNSPLASH_ACCESS_KEY_SECRET_ID,
};
