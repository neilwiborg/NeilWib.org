import { useEffect, useState } from "react";
import type { Meme } from "../../types/api";
import {
	createDone,
	createError,
	createLoading,
	type Loadable,
} from "../../types/loadable";
import { memeMakerClient } from "../clients/meme-maker.client";

type UseMemeTemplatesResult = {
	memes: Loadable<Meme[]>;
	searchMemes: (searchTerm: string) => Promise<void>;
};

const toErrorMessage = (caughtError: unknown) =>
	caughtError instanceof Error
		? caughtError.message
		: "Failed to load meme templates";

export const useMemeTemplates = (): UseMemeTemplatesResult => {
	const [memes, setMemes] = useState<Loadable<Meme[]>>(createLoading());

	useEffect(() => {
		let cancelled = false;

		const loadTopMemes = async () => {
			setMemes(createLoading());

			try {
				const response = await memeMakerClient.getTop100Memes();

				if (!cancelled) {
					setMemes(createDone(response.data.memes));
				}
			} catch (caughtError) {
				if (!cancelled) {
					setMemes(createError(toErrorMessage(caughtError)));
				}
			}
		};

		void loadTopMemes();

		return () => {
			cancelled = true;
		};
	}, []);

	const searchMemes = async (searchTerm: string) => {
		try {
			setMemes(createLoading());

			const response = await memeMakerClient.searchMemes(searchTerm);
			setMemes(createDone(response.data.memes));
		} catch (caughtError) {
			setMemes(createError(toErrorMessage(caughtError)));
		}
	};

	return { memes, searchMemes };
};
