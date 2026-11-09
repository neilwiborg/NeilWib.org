export type BackendUrlBuilder = (path: string) => string;

export const createBackendUrlBuilder = (prefix: string): BackendUrlBuilder => {
	const normalizedPrefix = prefix.replace(/\/+$/, "");

	return (path: string) => {
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;
		return `${normalizedPrefix}${normalizedPath}`;
	};
};
