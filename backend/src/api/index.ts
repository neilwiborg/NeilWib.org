import express from "express";
import { createDefaultApi } from "./default.api.js";
import { createMemeMakerApi } from "./meme-maker.api.js";
import { createPhotosApi } from "./photos.api.js";
import type { DefaultService } from "../service/default.service.js";
import type { MemeMakerService } from "../service/meme-maker.service.js";
import type { PhotosService } from "../service/photos.service.js";

type CreateApiParams = {
	defaultService: DefaultService;
	memeMakerService: MemeMakerService;
	photosService: PhotosService;
};

export const createApi = ({
	defaultService,
	memeMakerService,
	photosService,
}: CreateApiParams) => {
	const api = express.Router();

	api.use(createDefaultApi({ defaultService }));
	api.use(createMemeMakerApi({ memeMakerService }));
	api.use(createPhotosApi({ photosService }));

	return api;
};
