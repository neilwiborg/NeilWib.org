import type { MemeResponse } from "../../types/api";
import { fetchJson } from "./http.client";

export const memeMakerClient = {
	getTop100Memes: () => fetchJson<MemeResponse>("/mememaker/top100"),
	searchMemes: (searchTerm: string) =>
		fetchJson<MemeResponse>(
			`/mememaker/searchmemes?${new URLSearchParams({
				searchterm: searchTerm,
			}).toString()}`,
		),
};
