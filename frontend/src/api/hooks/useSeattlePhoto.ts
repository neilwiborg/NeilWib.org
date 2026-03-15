import { useEffect, useState } from "react";
import type { PhotoResponse } from "../../types/api";
import {
	createDone,
	createError,
	createLoading,
	type Loadable,
} from "../../types/loadable";
import { photosClient } from "../clients/photos.client";

const toErrorMessage = (caughtError: unknown) =>
	caughtError instanceof Error
		? caughtError.message
		: "Failed to load Seattle photo";

export const useSeattlePhoto = (): Loadable<PhotoResponse> => {
	const [photo, setPhoto] = useState<Loadable<PhotoResponse>>(createLoading());

	useEffect(() => {
		let cancelled = false;

		const loadPhoto = async () => {
			try {
				setPhoto(createLoading());

				const response = await photosClient.getSeattlePhoto();

				if (!cancelled) {
					setPhoto(createDone(response));
				}
			} catch (caughtError) {
				if (!cancelled) {
					setPhoto(createError(toErrorMessage(caughtError)));
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
