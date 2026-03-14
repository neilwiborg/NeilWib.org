import { JSDOM } from "jsdom";
import type {
	AddMemeResult,
	MemeTemplateStore,
} from "../store/meme-template.store.js";
import type {
	ImgflipClient,
	Meme,
	MemeResponse,
	ScrapedImgflipData,
} from "../client/imgflip.client.js";

export type { AddMemeResult } from "../store/meme-template.store.js";

export type MemeMakerService = {
	getMemeImage: (
		url: string,
	) => Promise<{ contentType: string; bytes: Buffer<ArrayBuffer> }>;
	getTop100Memes: () => Promise<MemeResponse>;
	searchMemes: (query: string) => Promise<MemeResponse>;
	addMemeFromImgflipUrl: (imgflipUrl: string) => Promise<AddMemeResult>;
};

type CreateMemeMakerServiceParams = {
	memeTemplateStore: MemeTemplateStore;
	imgflipClient: ImgflipClient;
	apiBaseUrl: string;
};

export class InvalidMemeUrlError extends Error {
	constructor() {
		super("Invalid URL");
		this.name = "InvalidMemeUrlError";
	}
}

export class MemeScrapeFailedError extends Error {
	constructor() {
		super("Invalid URL");
		this.name = "MemeScrapeFailedError";
	}
}

const sanitizeInputURL = (imgflipUrl: string) => {
	const regex = /https:\/\/imgflip.com\/(?:meme(?:template|generator)?)\/(.*)/;
	const regexMatches = imgflipUrl.match(regex);

	if (regexMatches === null || regexMatches.length < 2) {
		return "";
	}

	return "https://imgflip.com/memetemplate/" + regexMatches[1];
};

const toProxyUrl = (apiBaseUrl: string, imageUrl: string) => {
	const proxyUrl = new URL("/mememaker/meme", apiBaseUrl);
	proxyUrl.searchParams.set("url", imageUrl);
	return proxyUrl.toString();
};

const withProxyUrls = (apiBaseUrl: string, memes: Meme[]): Meme[] => {
	return memes.map((meme) => ({
		...meme,
		url: toProxyUrl(apiBaseUrl, meme.url),
	}));
};

const scrapeMeme = (pageContents: string): ScrapedImgflipData | null => {
	const dom = new JSDOM(pageContents);

	let title = dom.window.document.querySelector("#mtm-title")?.textContent;
	if (title !== null && title !== undefined) {
		if (title.endsWith(" Meme Template")) {
			title = title.replace(" Meme Template", "");
		} else if (title.endsWith(" Template")) {
			title = title.replace(" Template", "");
		}
	}

	let templateURL = dom.window.document
		.querySelector("#mtm-img")
		?.getAttribute("src");
	if (templateURL !== null && templateURL !== undefined) {
		if (templateURL.startsWith("//")) {
			templateURL = "https:" + templateURL;
		} else if (templateURL.startsWith("/")) {
			templateURL = "https://imgflip.com" + templateURL;
		}
	}

	let subtitle = dom.window.document.querySelector("#mtm-subtitle")?.textContent;
	const aka: string[] = [];
	if (subtitle !== null && subtitle !== undefined) {
		subtitle = subtitle.replace("also called: ", "");
		let windowText = "";
		for (let i = 0; i < subtitle.length; i++) {
			const c = subtitle[i];
			if (c === ",") {
				aka.push(windowText.trimStart().toLowerCase());
				windowText = "";
			} else {
				windowText += c;
			}
		}
		aka.push(windowText.trimStart().toLowerCase());
	}

	const description =
		dom.window.document.querySelector("#mtm-description")?.textContent ?? "";
	const properties = dom.window.document.querySelectorAll("#mtm-info > p");
	let imgflipID = -1;

	properties.forEach((tag) => {
		if (tag.textContent?.startsWith("Template ID")) {
			imgflipID = parseInt(tag.textContent.replace("Template ID: ", ""), 10);
		}
	});

	if (
		title === null ||
		title === undefined ||
		templateURL === null ||
		templateURL === undefined ||
		imgflipID === -1
	) {
		return null;
	}

	return {
		title,
		templateURL,
		aka,
		imgflipID,
		description,
	};
};

export const createMemeMakerService = ({
	memeTemplateStore,
	imgflipClient,
	apiBaseUrl,
}: CreateMemeMakerServiceParams): MemeMakerService => {
	return {
		getMemeImage: async (url: string) => {
			return imgflipClient.getMemeImage(url);
		},

		getTop100Memes: async () => {
			const topMemes = await imgflipClient.getTop100Memes();
			return {
				data: {
					memes: withProxyUrls(apiBaseUrl, topMemes.data.memes),
				},
			};
		},

		searchMemes: async (query: string) => {
			const topMemes = await imgflipClient.getTop100Memes();
			const matchingMemes = topMemes.data.memes.filter((meme) =>
				meme.name.toLowerCase().includes(query.toLowerCase()),
			);

			return {
				data: {
					memes: withProxyUrls(apiBaseUrl, matchingMemes),
				},
			};
		},

		addMemeFromImgflipUrl: async (imgflipUrl: string) => {
			const sanitizedUrl = sanitizeInputURL(imgflipUrl);
			if (sanitizedUrl === "") {
				throw new InvalidMemeUrlError();
			}

			const templatePage = await imgflipClient.getTemplatePage(sanitizedUrl);
			if (templatePage === null) {
				throw new MemeScrapeFailedError();
			}

			const imgflipData = scrapeMeme(templatePage);
			if (imgflipData === null) {
				throw new MemeScrapeFailedError();
			}

			return memeTemplateStore.addMemeTemplate(imgflipData);
		},
	};
};
