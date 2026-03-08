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

export type Meme = {
	id: string;
	name: string;
	url: string;
	width: number;
	height: number;
	box_count: number;
	captions: number;
};

export type MemeResponse = {
	data: { memes: Meme[] };
};
