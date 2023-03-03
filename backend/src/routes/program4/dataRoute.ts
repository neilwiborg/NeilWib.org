import express from 'express';
import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import usersData from '../data/ddb_example.json';

const defaultRegion = "us-west-2";
const s3Client = new S3Client({ region: defaultRegion });

type user = {
	lastName: string,
	firstName: string,
	attributes: Record<string, string>
}

type data = {
	users: user[]
}

const getInputFile = async () => {
	const bucketName = "css490";
	const s3Filename = "input.txt";
	const bucketParams = {
		Bucket: bucketName,
		Key: s3Filename
	};

	return await s3Client.send(new GetObjectCommand(bucketParams))
	.then((data) => {return data.Body?.transformToString()
	.then((transformedData) => transformedData)})
	.catch((err) => err);
}

const uploadUsersData = async (usersData: string) => {
	const bucketName = "neilwwebserver";
	const s3Filename = "userDataText.txt";
	const bucketParams = {
		Bucket: bucketName,
		Key: s3Filename,
		Body: usersData
	};

	return await s3Client.send(new PutObjectCommand(bucketParams))
	.then((data) => {data})
	.catch((err) => {err});
}

const deleteUsersData = async () => {
	const bucketName = "neilwwebserver";
	const s3Filename = "userDataText.txt";
	const bucketParams = {
		Bucket: bucketName,
		Key: s3Filename
	};

	s3Client.send(new DeleteObjectCommand(bucketParams));
}

const parseUsersData = (usersData: string) => {
	// remove extra whitespace
	usersData = usersData.replace("/\s+/g",' ').trim();
	let lines = usersData.split('\n');

	let resultData: data = {
		users: []
	}

	lines.forEach((item) => {
		let words = item.split(' ');
		let lastName = words[0];
		let firstName = words[1];
		resultData.users.push({
			firstName: firstName,
			lastName: lastName,
			attributes: {}
		});

		for (let i = 2; i < words.length; i++) {
			let [key, val] = words[i].split('=');
			resultData.users[resultData.users.length - 1].attributes[key] = val;
		}
	});

	return resultData;
}

export const dataRoute = express.Router();

dataRoute.put('/program4/data', (req, res, next) => {
	getInputFile()
	.then((data) => {
		let users = parseUsersData(data);
		console.log(users);
		uploadUsersData(data)
		.then((resp) => {
			res.send(resp);
		})
	});
});

dataRoute.delete('/program4/data', (req, res, next) => {
	deleteUsersData();
	res.send("Delete request fulfilled");
});

dataRoute.get('/program4/data', (req, res, next) => {
	res.send(JSON.stringify(usersData));
});
