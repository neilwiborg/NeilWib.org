import { createApp } from "./app.js";
import { createDependencies } from "./dependencies.js";
import { listen } from "./http-server.js";
import { SecretSourceType } from "./secret-source.js";

const getListenAddress = () => {
	const endpoint = process.env.AWS_LAMBDA_HTTP_ENDPOINT;
	if (endpoint === undefined) {
		// Required by the Lambda Web Function runtime: https://docs.aws.amazon.com/lambda/latest/dg/web-functions-runtimes.html
		throw new Error(
			"AWS_LAMBDA_HTTP_ENDPOINT must be set by the Lambda Web Function runtime.",
		);
	}

	const separator = endpoint.lastIndexOf(":");
	const host = endpoint.slice(0, separator);
	const port = Number(endpoint.slice(separator + 1));
	if (separator < 1 || host.length === 0 || !Number.isInteger(port)) {
		throw new Error(
			`AWS_LAMBDA_HTTP_ENDPOINT must be in host:port format; received "${endpoint}".`,
		);
	}

	return { host, port };
};

const start = async () => {
	const address = getListenAddress();
	const api = await createDependencies(SecretSourceType.SecretsManager);
	listen(createApp({ api }), address);
};

await start();
