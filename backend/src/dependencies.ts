import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createApi as createUnsplashApi } from "unsplash-js";
import { createBackendUrlBuilder } from "./api/backend-url.js";
import { createApi } from "./api/index.js";
import { createImgflipClient } from "./client/imgflip.client.js";
import { config } from "./config.js";
import { createDefaultService } from "./service/default.service.js";
import { createMemeMakerService } from "./service/meme-maker.service.js";
import { createPhotosService } from "./service/photos.service.js";
import { createMemeTemplateStore } from "./store/meme-template.store.js";

const defaultRegion = "us-west-2";

export const createDependencies = () => {
	const createBackendUrl = createBackendUrlBuilder(config.publicApiPrefix);

	// clients
	const ddbClient = new DynamoDBClient({ region: defaultRegion });
	const unsplash = createUnsplashApi({
		accessKey: config.unsplashAccessKey,
	});
	const imgflipClient = createImgflipClient();

	// stores
	const memeTemplateStore = createMemeTemplateStore({ ddbClient });

	// services
	const defaultService = createDefaultService();
	const memeMakerService = createMemeMakerService({
		memeTemplateStore,
		imgflipClient,
		createBackendUrl,
	});
	const photosService = createPhotosService({ unsplash });

	return createApi({
		defaultService,
		memeMakerService,
		photosService,
	});
};
