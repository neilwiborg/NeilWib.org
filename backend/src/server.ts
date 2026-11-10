import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDependencies } from "./dependencies.js";
import { listen } from "./http-server.js";
import { SecretSourceType } from "./secret-source.js";

if (config.port === false) {
	throw new Error("API_PORT must be a valid port number or pipe name.");
}
const port = config.port;

const start = async () => {
	const api = await createDependencies(SecretSourceType.Environment);
	listen(createApp({ api }), { port });
};

await start();
