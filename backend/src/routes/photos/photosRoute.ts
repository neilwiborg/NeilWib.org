import express from "express";
import { createApi } from "unsplash-js";
import dotenv from "dotenv";

dotenv.config();

export const photosRoute = express.Router();

const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY ?? "";
const unsplash = createApi({
	accessKey: unsplashAccessKey,
});
const UNSPLASH_URL = new URL("https://unsplash.com/");
const UTM_PARAMS = new URLSearchParams({
	utm_source: "Personal Website",
	utm_medium: "referral",
});

type photoAuthor = {
	firstName: string;
	middleName?: string;
	lastName: string;
	profileURL: string;
};

type photoResponse = {
	sourceName: string;
	sourceURL: string;
	imageURL: string;
	author: photoAuthor;
};

const addUTMParams = (url: URL) => {
	UTM_PARAMS.forEach((value, key) => url.searchParams.append(key, value));
	return url;
};

photosRoute.get("/photos/seattle", async (req, res, next) => {
	const unsplashResponse = await unsplash.photos.get({
		photoId: "JEicDFy5Cd8",
	});
	if (unsplashResponse.errors) {
		// TODO
	}
	const sanitizedResponse = unsplashResponse.response!;

	const response: photoResponse = {
		sourceName: "Unsplash",
		sourceURL: addUTMParams(UNSPLASH_URL).toString(),
		imageURL: addUTMParams(new URL(sanitizedResponse.urls.regular)).toString(),
		author: {
			firstName: sanitizedResponse.user.first_name,
			lastName: sanitizedResponse.user.last_name ?? "",
			profileURL: addUTMParams(
				new URL(sanitizedResponse.user.links.html),
			).toString(),
		},
	};

	res.json(response);
});
