import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import express from 'express';

const defaultRegion = 'us-west-2';
const ddbClient = new DynamoDBClient({ region: defaultRegion });

export const PeerReviewsRoute = express.Router();

const getPeers = async () => {
	const params = {
		TableName: 'peers'
	};
	let data = await ddbClient.send(new ScanCommand(params));
	let formatted = data.Items?.map((entry) => {
		let peer: Record<string, string> = {}
		for (const [key, value] of Object.entries(entry)) {
			peer[key] = value["S"] ?? "";
		}
		return peer;
	});
	return formatted;
};

const getProjects = async () => {
	const params = {
		TableName: 'css490projects'
	};
	let data = await ddbClient.send(new ScanCommand(params));
	let formatted = data.Items?.map((entry) => {
		let project: Record<string, string> = {}
		for (const [key, value] of Object.entries(entry)) {
			project[key] = value["S"] ?? "";
		}
		return project;
	});
	return formatted;
};

PeerReviewsRoute.get('/peerreviews', async (req, res, next) => {
	let peers = await getPeers();
	let projects = await getProjects();
	res.json({"peers": peers, "projects": projects});
});
