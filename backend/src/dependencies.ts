import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";
import { createApi as createUnsplashApi } from "unsplash-js";
import { createApi } from "./api/index.js";
import { createImgflipClient } from "./client/imgflip.client.js";
import { createDefaultService } from "./service/default.service.js";
import { createMemeMakerService } from "./service/meme-maker.service.js";
import { createPhotosService } from "./service/photos.service.js";
import { createMemeTemplateStore } from "./store/meme-template.store.js";

dotenv.config();

const defaultRegion = "us-west-2";

export const createDependencies = () => {
	const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY ?? "";
	const apiBaseUrl = process.env.API_BASE_URL ?? "https://api.neilwib.org";

	// clients
	const ddbClient = new DynamoDBClient({ region: defaultRegion });
	const unsplash = createUnsplashApi({
		accessKey: unsplashAccessKey,
	});
	const imgflipClient = createImgflipClient();

	// stores
	const memeTemplateStore = createMemeTemplateStore({ ddbClient });

	// services
	const defaultService = createDefaultService();
	const memeMakerService = createMemeMakerService({
		memeTemplateStore,
		imgflipClient,
		apiBaseUrl,
	});
	const photosService = createPhotosService({ unsplash });

	return createApi({
		defaultService,
		memeMakerService,
		photosService,
	});
};
