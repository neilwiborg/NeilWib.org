import {
	GetSecretValueCommand,
	type SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export enum SecretSourceType {
	Environment = "environment",
	SecretsManager = "secrets-manager",
}

export interface SecretSource {
	getUnsplashAccessKey(): Promise<string>;
}

/** Reads secrets from the environment. */
export class EnvironmentSecretSource implements SecretSource {
	async getUnsplashAccessKey(): Promise<string> {
		return process.env.UNSPLASH_ACCESS_KEY ?? "";
	}
}

/** Reads secrets from AWS Secrets Manager. */
export class SecretsManagerSecretSource implements SecretSource {
	constructor(
		private readonly client: SecretsManagerClient,
		private readonly secretId: string,
	) {}

	async getUnsplashAccessKey(): Promise<string> {
		const result = await this.client.send(
			new GetSecretValueCommand({ SecretId: this.secretId }),
		);
		if (result.SecretString === undefined) {
			throw new Error(
				`Secrets Manager secret "${this.secretId}" does not contain a string value.`,
			);
		}
		return result.SecretString;
	}
}
