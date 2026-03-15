import { AsyncLocalStorage } from "node:async_hooks";
import type { Logger } from "pino";
import { logger } from "./logger.js";

type RequestContext = {
	log: Logger;
	requestId?: string;
};

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = <T>(
	context: RequestContext,
	callback: () => T,
) => asyncLocalStorage.run(context, callback);

export const getRequestContext = () => asyncLocalStorage.getStore();

export const getLogger = () => getRequestContext()?.log ?? logger;

export const withLogContext = <T>(
	bindings: Record<string, unknown>,
	callback: () => T,
) => {
	const parentContext = getRequestContext();
	const parentLogger = parentContext?.log ?? logger;
	const childLogger = parentLogger.child(bindings);

	return asyncLocalStorage.run(
		{
			...parentContext,
			log: childLogger,
		},
		callback,
	);
};
