import { DynamoDBClient, type QueryCommandOutput, ScanCommand, type ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import express from 'express';

const defaultRegion = 'us-west-2';
const ddbClient = new DynamoDBClient({ region: defaultRegion });

export const PeerReviewsRoute = express.Router();

const formatDDBResults = (results: ScanCommandOutput | QueryCommandOutput) => {
	let formatted = results.Items?.map((entry) => {
		let record: Record<string, string | number> = {}
		for (const [key, value] of Object.entries(entry)) {
			if (value.hasOwnProperty("S")) {
				record[key] = value["S"]!;
			} else if (value.hasOwnProperty("N")) {
				record[key] = parseInt(value["N"]!);
			} else {
				record[key] = "";
			}
		}
		return record;
	});
	return formatted;
};

const getPeers = async () => {
	const params = {
		TableName: 'peers'
	};
	let data = await ddbClient.send(new ScanCommand(params));
	let formatted = formatDDBResults(data);
	return formatted;
};

const getProjects = async () => {
	const params = {
		TableName: 'css490projects'
	};
	let data = await ddbClient.send(new ScanCommand(params));
	let formatted = formatDDBResults(data);
	return formatted;
};

PeerReviewsRoute.get('/peerreviews', async (req, res, next) => {
	let peers = await getPeers();
	let projects = await getProjects();
	res.json({"peers": peers, "projects": projects});
});
