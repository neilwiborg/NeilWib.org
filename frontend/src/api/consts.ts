const apiPrefix = import.meta.env.VITE_API_PREFIX;

if (!apiPrefix) {
	throw new Error("VITE_API_PREFIX must be configured for the frontend.");
}

export const API_PREFIX = apiPrefix;
