import type { PageLoad } from "../../$types";

export const load = ({ url }) => {
    let memeName = url.searchParams.get('name');
    let memeImageURL = url.searchParams.get('templateUrl');
	return {
		params: {
            name: memeName,
            imageURL: memeImageURL
        }
	};
};
