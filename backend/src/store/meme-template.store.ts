import {
	type AttributeValue,
	type DynamoDBClient,
	PutItemCommand,
	type PutItemCommandInput,
	type PutItemCommandOutput,
	ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const tablename = "mememaker-templates";

export type MemeTemplateRecord = {
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

export type MemeTemplateStore = {
	addMemeTemplate: (imgflipData: MemeTemplateRecord) => Promise<AddMemeResult>;
};

type CreateMemeTemplateStoreParams = {
	ddbClient: DynamoDBClient;
};

export const createMemeTemplateStore = ({
	ddbClient,
}: CreateMemeTemplateStoreParams): MemeTemplateStore => {
	return {
		addMemeTemplate: async (
			imgflipData: MemeTemplateRecord,
		): Promise<AddMemeResult> => {
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
		},
	};
};
