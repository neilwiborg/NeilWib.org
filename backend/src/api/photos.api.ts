import express from "express";
import {
	type PhotosService,
	UnsplashResponseError,
} from "../service/photos.service.js";

type CreatePhotosApiParams = {
	photosService: PhotosService;
};

export const createPhotosApi = ({ photosService }: CreatePhotosApiParams) => {
	const photosApi = express.Router();

	photosApi.get("/photos/seattle", async (req, res, next) => {
		try {
			const response = await photosService.getSeattlePhoto();
			res.json(response);
		} catch (error) {
			if (error instanceof UnsplashResponseError) {
				res.status(502).send(error.message);
				return;
			}
			next(error);
		}
	});

	return photosApi;
};
