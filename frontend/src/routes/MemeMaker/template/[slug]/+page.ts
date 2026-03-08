import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
	const memeName = url.searchParams.get("name");
	const memeImageURL = url.searchParams.get("templateUrl");
	return {
		params: {
			name: memeName,
			imageURL: memeImageURL,
		},
	};
};
