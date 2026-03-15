import { useEffect, useState } from "react";
import type { Meme } from "../../types/api";
import type { Loadable } from "../../types/loadable";
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
	const [memes, setMemes] = useState<Loadable<Meme[]>>({
		state: "loading",
	});

	useEffect(() => {
		let cancelled = false;

		const loadTopMemes = async () => {
			setMemes({ state: "loading" });

			try {
				const response = await memeMakerClient.getTop100Memes();

				if (!cancelled) {
					setMemes({ state: "done", value: response.data.memes });
				}
			} catch (caughtError) {
				if (!cancelled) {
					setMemes({
						state: "error",
						message: toErrorMessage(caughtError),
					});
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
			setMemes({ state: "loading" });

			const response = await memeMakerClient.searchMemes(searchTerm);
			setMemes({ state: "done", value: response.data.memes });
		} catch (caughtError) {
			setMemes({
				state: "error",
				message: toErrorMessage(caughtError),
			});
		}
	};

	return { memes, searchMemes };
};
