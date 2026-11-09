import http from "node:http";
import type { Express } from "express";
import { logger } from "./logger.js";

type ListenOptions = {
	host?: string;
	port: number | string;
};

export const listen = (app: Express, { host, port }: ListenOptions) => {
	app.set("port", port);

	const server = http.createServer(app);

	server.on("error", (error: NodeJS.ErrnoException) => {
		if (error.syscall !== "listen") throw error;
		const bind = `${host ?? "0.0.0.0"}:${port}`;

		switch (error.code) {
			case "EACCES":
				logger.fatal(
					{ err: error, bind },
					"Server requires elevated privileges",
				);
				process.exit(1);
			case "EADDRINUSE":
				logger.fatal({ err: error, bind }, "Server port is already in use");
				process.exit(1);
			default:
				throw error;
		}
	});

	server.on("listening", () => {
		const addr = server.address();
		const bind =
			typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
		logger.info({ bind, host }, "Server listening");
	});

	if (typeof port === "string" || host === undefined) {
		server.listen(port);
	} else {
		server.listen(port, host);
	}
	return server;
};
