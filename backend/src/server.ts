import http from "http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDependencies } from "./dependencies.js";
import { logger } from "./logger.js";

const api = createDependencies();
const app = createApp({ api });
const port = config.port;
app.set("port", port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (error: NodeJS.ErrnoException) => {
	if (error.syscall !== "listen") throw error;
	const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

	switch (error.code) {
		case "EACCES":
			logger.fatal({ err: error, bind }, "Server requires elevated privileges");
			process.exit(1);
		case "EADDRINUSE":
			logger.fatal({ err: error, bind }, "Server port is already in use");
			process.exit(1);
		default:
			throw error;
	}
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
	const addr = server.address();
	const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
	logger.info({ bind }, "Server listening");
};

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
