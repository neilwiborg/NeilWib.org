import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import usersData from '../data/ddb_example.json';

const defaultRegion = "us-west-2";
const bucketName = "neilwwebserver";
const s3Filename = "userDataText.txt";

const s3Client = new S3Client({ region: defaultRegion });
const bucketParams = {
	Bucket: bucketName,
	Key: s3Filename
};
const sourceAddress = "https://s3-us-west-2.amazonaws.com/css490/input.txt";

export const dataRoute = express.Router();

dataRoute.put('/program4/data', (req, res, next) => {
	s3Client.send(new GetObjectCommand(bucketParams))
	.then((data) => data.Body?.transformToString()
	.then((transformedData) => res.send(transformedData)))
	.catch((err) => res.send(err));
	// res.send("Put request fulfilled");
});

dataRoute.delete('/program4/data', (req, res, next) => {
	res.send("Delete request fulfilled");
});

dataRoute.get('/program4/data', (req, res, next) => {
	res.send(JSON.stringify(usersData));
});
