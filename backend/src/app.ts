import { randomUUID } from "node:crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
	type Router,
} from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./logger.js";
import { runWithRequestContext } from "./request-context.js";

type CreateAppParams = {
	api: Router;
};

const createHttpLoggerMiddleware = () =>
	pinoHttp({
		customLogLevel: (_req, res, err) =>
			err || res.statusCode >= 400 ? "error" : "debug",
		customReceivedMessage: () => "request received",
		genReqId: (req) => req.headers["x-request-id"]?.toString() ?? randomUUID(),
		logger,
	});

const createRequestContextMiddleware =
	() => (req: Request, res: Response, next: NextFunction) =>
		runWithRequestContext(
			{
				log: req.log,
				requestId: req.id?.toString(),
			},
			next,
		);

const createNotFoundMiddleware = () => (req: Request, res: Response) =>
	res.status(404).send("Not Found");

const createErrorHandlerMiddleware =
	() => (err: any, req: Request, res: Response, next: NextFunction) => {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get("env") === "development" ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.send("error");
	};

export const createApp = ({ api }: CreateAppParams) => {
	const app = express();

	app.set("trust proxy", true);

	app.use(cors());
	app.use(createHttpLoggerMiddleware());
	app.use(createRequestContextMiddleware());
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieParser());

	app.use("/", api);

	app.use(createNotFoundMiddleware());
	app.use(createErrorHandlerMiddleware());

	return app;
};
