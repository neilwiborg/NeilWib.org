import type { createApi } from "unsplash-js";

const UNSPLASH_URL = new URL("https://unsplash.com/");
const UTM_PARAMS = new URLSearchParams({
	utm_source: "Personal Website",
	utm_medium: "referral",
});

export type PhotoAuthor = {
	firstName: string;
	middleName?: string;
	lastName: string;
	profileURL: string;
};

export type PhotoResponse = {
	sourceName: string;
	sourceURL: string;
	imageURL: string;
	author: PhotoAuthor;
};

export type PhotosService = {
	getSeattlePhoto: () => Promise<PhotoResponse>;
};

type CreatePhotosServiceParams = {
	unsplash: ReturnType<typeof createApi>;
};

const addUTMParams = (url: URL) => {
	UTM_PARAMS.forEach((value, key) => url.searchParams.append(key, value));
	return url;
};

export class UnsplashResponseError extends Error {
	constructor() {
		super("Unable to fetch Unsplash photo");
		this.name = "UnsplashResponseError";
	}
}

export const createPhotosService = ({
	unsplash,
}: CreatePhotosServiceParams): PhotosService => {
	return {
		getSeattlePhoto: async (): Promise<PhotoResponse> => {
			const unsplashResponse = await unsplash.GET("/photos/{assetSlug}", {
				params: {
					path: {
						assetSlug: "JEicDFy5Cd8",
					},
				},
			});

			if (unsplashResponse.error || !unsplashResponse.data) {
				throw new UnsplashResponseError();
			}

			const sanitizedResponse = unsplashResponse.data;

			return {
				sourceName: "Unsplash",
				sourceURL: addUTMParams(UNSPLASH_URL).toString(),
				imageURL: addUTMParams(
					new URL(sanitizedResponse.urls.regular),
				).toString(),
				author: {
					firstName: sanitizedResponse.user.first_name,
					lastName: sanitizedResponse.user.last_name ?? "",
					profileURL: addUTMParams(
						new URL(sanitizedResponse.user.links.html),
					).toString(),
				},
			};
		},
	};
};
