import { BACKEND_HOSTNAME } from "../../config";

export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

const createUrl = (path: string) => new URL(path, BACKEND_HOSTNAME).toString();

export const fetchJson = async <T>(
	path: string,
	init?: RequestInit,
): Promise<T> => {
	const response = await fetch(createUrl(path), init);

	if (!response.ok) {
		throw new ApiError(response.status, response.statusText);
	}

	return (await response.json()) as T;
};
