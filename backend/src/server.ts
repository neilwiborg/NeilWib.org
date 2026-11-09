import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDependencies } from "./dependencies.js";
import { listen } from "./http-server.js";

if (config.port === false) {
	throw new Error("API_PORT must be a valid port number or pipe name.");
}

listen(createApp({ api: createDependencies() }), { port: config.port });
