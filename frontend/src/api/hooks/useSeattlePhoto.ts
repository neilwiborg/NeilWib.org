import { useEffect, useState } from "react";
import type { PhotoResponse } from "../../types/api";
import type { Loadable } from "../../types/loadable";
import { photosClient } from "../clients/photos.client";

const toErrorMessage = (caughtError: unknown) =>
	caughtError instanceof Error
		? caughtError.message
		: "Failed to load Seattle photo";

export const useSeattlePhoto = (): Loadable<PhotoResponse> => {
	const [photo, setPhoto] = useState<Loadable<PhotoResponse>>({
		state: "loading",
	});

	useEffect(() => {
		let cancelled = false;

		const loadPhoto = async () => {
			try {
				setPhoto({ state: "loading" });

				const response = await photosClient.getSeattlePhoto();

				if (!cancelled) {
					setPhoto({ state: "done", value: response });
				}
			} catch (caughtError) {
				if (!cancelled) {
					setPhoto({
						state: "error",
						message: toErrorMessage(caughtError),
					});
				}
			}
		};

		void loadPhoto();

		return () => {
			cancelled = true;
		};
	}, []);

	return photo;
};
