import {
	type AttributeValue,
	DynamoDBClient,
	PutItemCommand,
	type PutItemCommandInput,
	ScanCommand,
	type PutItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { JSDOM } from "jsdom";
import { URLSearchParams } from "url";

const defaultRegion = "us-west-2";
const ddbClient = new DynamoDBClient({ region: defaultRegion });

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

type ScrapedImgflipData = {
	title: string;
	templateURL: string;
	aka: string[];
	imgflipID: number;
	description: string;
};

export type AddMemeResult =
	| PutItemCommandOutput
	| { message: "AlreadyExists"; id?: string }
	| { message: "ErrorAddingMeme" };

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

const getImgflipMemeBlob = async (url: string) => {
	const res = await fetch(url);
	return res.blob();
};

export const getMemeImage = async (url: string) => {
	const resp = await getImgflipMemeBlob(url);
	const arrayBuffer = await resp.arrayBuffer();

	return {
		contentType: resp.type || "image/jpeg",
		bytes: Buffer.from(arrayBuffer),
	};
};

export const getTop100Memes = async () => {
	const res = await fetch("https://api.imgflip.com/get_memes");
	const resJson: MemeResponse = await res.json();

	for (const meme of resJson.data.memes) {
		const urlParam = encodeURIComponent(meme.url);
		meme.url =
			"https://api.neilwib.org/mememaker/meme?" +
			new URLSearchParams({
				url: urlParam,
			});
	}

	return resJson;
};

export const searchMemes = async (query: string) => {
	const topMemes = await getTop100Memes();
	const result: MemeResponse = { data: { memes: [] } };

	for (const meme of topMemes.data.memes) {
		if (meme.name.toLowerCase().includes(query.toLowerCase())) {
			result.data.memes.push(meme);
		}
	}

	return result;
};

const sanitizeInputURL = (imgflipUrl: string) => {
	const regex = /https:\/\/imgflip.com\/(?:meme(?:template|generator)?)\/(.*)/;
	const regexMatches = imgflipUrl.match(regex);

	if (regexMatches === null || regexMatches.length < 2) {
		return "";
	}

	return "https://imgflip.com/memetemplate/" + regexMatches[1];
};

const scrapeMeme = async (imgflipUrl: string) => {
	const page = await fetch(imgflipUrl);
	if (!page.ok) {
		return null;
	}

	const pageContents = await page.text();
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
	} satisfies ScrapedImgflipData;
};

const addToDB = async (imgflipData: ScrapedImgflipData): Promise<AddMemeResult> => {
	const tablename = "mememaker-templates";
	const id = randomUUID();

	const item: Record<string, AttributeValue> = {
		id: { S: id },
		title: { S: imgflipData.title },
		templateURL: { S: imgflipData.templateURL },
		imgflipID: { N: imgflipData.imgflipID.toString() },
		description: { S: imgflipData.description },
		_aka: { SS: imgflipData.aka },
		_searchTitle: { S: imgflipData.title.toLowerCase() }, // TODO: remove punctuation
	};

	const params: PutItemCommandInput = {
		TableName: tablename,
		Item: item,
	};

	const scanParams = {
		FilterExpression: "imgflipID = :imgflipID",
		ExpressionAttributeValues: {
			":imgflipID": { N: imgflipData.imgflipID.toString() },
		},
		TableName: tablename,
	};

	// do scan (add GSI?) to check for imgflipID already existing in table
	const scanResp = await ddbClient.send(new ScanCommand(scanParams));
	if (scanResp.Items === undefined || scanResp.Items.length === undefined) {
		return { message: "ErrorAddingMeme" };
	}
	if (scanResp.Items.length > 0) {
		return { message: "AlreadyExists", id: scanResp.Items[0].id.S };
	}

	return ddbClient.send(new PutItemCommand(params));
};

export const addMemeFromImgflipUrl = async (imgflipUrl: string) => {
	const sanitizedUrl = sanitizeInputURL(imgflipUrl);
	if (sanitizedUrl === "") {
		throw new InvalidMemeUrlError();
	}

	const imgflipData = await scrapeMeme(sanitizedUrl);
	if (imgflipData === null) {
		throw new MemeScrapeFailedError();
	}

	return addToDB(imgflipData);
};
