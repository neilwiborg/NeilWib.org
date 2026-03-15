import type { PhotoResponse } from "../../types/api";
import { fetchJson } from "./http.client";

export const photosClient = {
	getSeattlePhoto: () => fetchJson<PhotoResponse>("/photos/seattle"),
};
