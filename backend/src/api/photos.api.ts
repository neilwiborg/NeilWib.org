import express from "express";
import {
	getSeattlePhoto,
	UnsplashResponseError,
} from "../service/photos.service.js";

export const photosApi = express.Router();

photosApi.get("/photos/seattle", async (req, res, next) => {
	try {
		const response = await getSeattlePhoto();
		res.json(response);
	} catch (error) {
		if (error instanceof UnsplashResponseError) {
			res.status(502).send(error.message);
			return;
		}
		next(error);
	}
});
