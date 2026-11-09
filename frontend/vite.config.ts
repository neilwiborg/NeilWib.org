import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const envDir = fileURLToPath(new URL("../", import.meta.url));
const MAX_PORT = 65535;

const stripApiPrefix = (path: string, apiPrefix: string) => {
	if (path === apiPrefix) return "/";
	if (path.startsWith(`${apiPrefix}/`)) {
		return path.slice(apiPrefix.length);
	}
	return path;
};

const parsePort = (value: string | undefined, variableName: string) => {
	const port = Number(value);
	if (!value || !Number.isInteger(port) || port < 1 || port > MAX_PORT) {
		throw new Error(`${variableName} must be a valid port number.`);
	}
	return port;
};

const createDevServerConfig = (
	apiPrefix: string,
	apiPortValue: string | undefined,
	frontendPortValue: string | undefined,
) => {
	const apiPort = parsePort(apiPortValue, "API_PORT");
	const frontendPort = parsePort(frontendPortValue, "FRONTEND_PORT");

	return {
		port: frontendPort,
		strictPort: true,
		proxy: {
			[apiPrefix]: {
				target: `http://localhost:${apiPort}`,
				changeOrigin: true,
				rewrite: (path: string) => stripApiPrefix(path, apiPrefix),
			},
		},
	};
};

export default defineConfig(({ command, isPreview, mode }) => {
	const envPrefixes = ["VITE_", "API_PORT", "FRONTEND_PORT"];
	const { API_PORT, FRONTEND_PORT, VITE_API_PREFIX } = loadEnv(
		mode,
		envDir,
		envPrefixes,
	);
	const isDevServer = command === "serve" && isPreview !== true;

	if (!VITE_API_PREFIX) {
		throw new Error("VITE_API_PREFIX must be configured for the frontend.");
	}

	const server = isDevServer
		? createDevServerConfig(VITE_API_PREFIX, API_PORT, FRONTEND_PORT)
		: undefined;

	return {
		envDir,
		plugins: [react()],
		server,
	};
});
