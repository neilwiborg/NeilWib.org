import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { createApi as createUnsplashApi } from "unsplash-js";
import { createBackendUrlBuilder } from "./api/backend-url.js";
import { createApi } from "./api/index.js";
import { createImgflipClient } from "./client/imgflip.client.js";
import { config } from "./config.js";
import {
	EnvironmentSecretSource,
	SecretSourceType,
	SecretsManagerSecretSource,
} from "./secret-source.js";
import { createDefaultService } from "./service/default.service.js";
import { createMemeMakerService } from "./service/meme-maker.service.js";
import { createPhotosService } from "./service/photos.service.js";
import { createMemeTemplateStore } from "./store/meme-template.store.js";

const createSecretSource = (sourceType: SecretSourceType) => {
	switch (sourceType) {
		case SecretSourceType.Environment:
			return new EnvironmentSecretSource();
		case SecretSourceType.SecretsManager: {
			const secretId = config.unsplashAccessKeySecretId;
			if (secretId === undefined || secretId.length === 0) {
				throw new Error(
					"UNSPLASH_ACCESS_KEY_SECRET_ID must be set when using Secrets Manager.",
				);
			}
			const client = new SecretsManagerClient({
				region: config.region,
			});
			return new SecretsManagerSecretSource(client, secretId);
		}
	}
};

export const createDependencies = async (
	secretSourceType: SecretSourceType,
) => {
	const createBackendUrl = createBackendUrlBuilder(config.publicApiPrefix);
	const secretSource = createSecretSource(secretSourceType);
	const unsplashAccessKey = await secretSource.getUnsplashAccessKey();

	// clients
	const ddbClient = new DynamoDBClient({ region: config.region });
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
		createBackendUrl,
	});
	const photosService = createPhotosService({ unsplash });

	return createApi({
		defaultService,
		memeMakerService,
		photosService,
	});
};
