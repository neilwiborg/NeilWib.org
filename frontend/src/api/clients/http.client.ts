import { API_PREFIX } from "../consts";

export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

export const createApiUrl = (path: string) =>
	`${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

export const fetchJson = async <T>(
	path: string,
	init?: RequestInit,
): Promise<T> => {
	const response = await fetch(createApiUrl(path), init);

	if (!response.ok) {
		throw new ApiError(response.status, response.statusText);
	}

	return (await response.json()) as T;
};
