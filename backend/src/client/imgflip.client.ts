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

export type ScrapedImgflipData = {
	title: string;
	templateURL: string;
	aka: string[];
	imgflipID: number;
	description: string;
};

export type ImgflipClient = {
	getMemeImage: (
		url: string,
	) => Promise<{ contentType: string; bytes: Buffer<ArrayBuffer> }>;
	getTop100Memes: () => Promise<MemeResponse>;
	getTemplatePage: (imgflipUrl: string) => Promise<string | null>;
};

const getImgflipMemeBlob = async (url: string) => {
	const res = await fetch(url);
	return res.blob();
};

export const createImgflipClient = (): ImgflipClient => {
	return {
		getMemeImage: async (url: string) => {
			const resp = await getImgflipMemeBlob(url);
			const arrayBuffer = await resp.arrayBuffer();

			return {
				contentType: resp.type || "image/jpeg",
				bytes: Buffer.from(arrayBuffer),
			};
		},

		getTop100Memes: async () => {
			const res = await fetch("https://api.imgflip.com/get_memes");
			return res.json();
		},

		getTemplatePage: async (imgflipUrl: string) => {
			const page = await fetch(imgflipUrl);
			if (!page.ok) {
				return null;
			}

			return page.text();
		},
	};
};
