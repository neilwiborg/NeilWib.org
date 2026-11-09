import { fileURLToPath } from "node:url";
import dotenvFlow from "dotenv-flow";

dotenvFlow.config({
	path: fileURLToPath(new URL("../../", import.meta.url)),
});

const normalizePort = (value: string): number | string | false => {
	const port = Number.parseInt(value, 10);
	return Number.isNaN(port) ? value : port >= 0 ? port : false;
};

const publicApiPrefix = process.env.PUBLIC_API_PREFIX;
if (publicApiPrefix === undefined) {
	throw new Error("PUBLIC_API_PREFIX must be configured for the backend.");
}

export const config = {
	logLevel:
		process.env.LOG_LEVEL ??
		(process.env.NODE_ENV !== "production" ? "debug" : "info"),
	port: normalizePort(process.env.API_PORT ?? "3000"),
	publicApiPrefix,
	unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY ?? "",
};
