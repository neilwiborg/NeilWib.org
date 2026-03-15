import express from "express";
import {
	InvalidMemeUrlError,
	type MemeMakerService,
	MemeScrapeFailedError,
} from "../service/meme-maker.service.js";

type CreateMemeMakerApiParams = {
	memeMakerService: MemeMakerService;
};

export const createMemeMakerApi = ({
	memeMakerService,
}: CreateMemeMakerApiParams) => {
	const mememakerApi = express.Router();

	mememakerApi.get("/mememaker/meme", async (req, res, next) => {
		try {
			const url = decodeURIComponent(req.query.url as string);
			const resp = await memeMakerService.getMemeImage(url);

			res.set("Content-Type", resp.contentType);
			res.send(resp.bytes);
		} catch (error) {
			next(error);
		}
	});

	mememakerApi.get("/mememaker/top100", async (req, res, next) => {
		try {
			const resp = await memeMakerService.getTop100Memes();
			res.send(resp);
		} catch (error) {
			next(error);
		}
	});

	mememakerApi.get("/mememaker/searchmemes", async (req, res, next) => {
		try {
			const searchterm = req.query.searchterm as string;
			const resp = await memeMakerService.searchMemes(searchterm);
			res.send(resp);
		} catch (error) {
			next(error);
		}
	});

	mememakerApi.get("/mememaker/addmeme", async (req, res, next) => {
		try {
			if (req.query.url === undefined) {
				res.status(400).send("No URL provided");
				return;
			}

			const url = decodeURIComponent(req.query.url as string);
			const dbResp = await memeMakerService.addMemeFromImgflipUrl(url);
			res.send(dbResp);
		} catch (error) {
			if (error instanceof InvalidMemeUrlError) {
				res.status(400).send("Invalid URL");
				return;
			}
			if (error instanceof MemeScrapeFailedError) {
				res.status(400).send("Invalid URL");
				return;
			}
			next(error);
		}
	});

	return mememakerApi;
};
