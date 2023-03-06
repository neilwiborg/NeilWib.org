import express from 'express';
import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { type AttributeValue, DynamoDBClient, PutItemCommand, type PutItemCommandInput, type BatchWriteItemCommandInput, BatchWriteItemCommand, WriteRequest } from "@aws-sdk/client-dynamodb";
import usersData from '../data/ddb_example.json';

const defaultRegion = "us-west-2";
const s3Client = new S3Client({ region: defaultRegion });
const ddbClient = new DynamoDBClient({ region : defaultRegion });

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

const uploadUsersFileToS3 = async (usersData: string) => {
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

const uploadUsersDataToDDb = async (usersData: data) => {
	const tableName = "webserverUsersData";
	let batchCount = 0;
	const params: BatchWriteItemCommandInput = {
		RequestItems: {
			[tableName]: []
		}
	}
	usersData.users.forEach(async (item) => {
		const itemProps: WriteRequest = {
			PutRequest: {
				Item: {
					lastName: {S: item.lastName },
					firstName: {S: item.firstName }
				}
			}
		}

		for (let key in item.attributes) {
			itemProps.PutRequest!.Item![key] = {S: item.attributes[key]}
		}

		params.RequestItems![tableName].push(itemProps);

		batchCount++;

		// can send max 25 items
		if (batchCount == 25) {
			// send batch and wait
			await ddbClient.send(new BatchWriteItemCommand(params));

			// clear items and reset count
			params.RequestItems![tableName] = [];
			batchCount = 0;
		}
	});

	// send remaining items, if any
	if (batchCount > 0) {
		// send batch and wait
		await ddbClient.send(new BatchWriteItemCommand(params));

		// clear items and reset count
		params.RequestItems![tableName] = [];
		batchCount = 0;
	}
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
	// split into array of lines
	let lines = usersData.split("\r\n");

	// hold the parsed data
	let resultData: data = {
		users: []
	}

	// iterate over each line
	lines.forEach((item) => {
		// split the current line into words
		let words = item.split(' ');
		// the first word is always the last name
		let lastName = words[0];
		// the second word is always the first name
		let firstName = words[1];
		// add a new user to the parsed data
		resultData.users.push({
			firstName: firstName,
			lastName: lastName,
			attributes: {}
		});

		// if there are any additional words in the line, then
		// iterate over them
		for (let i = 2; i < words.length; i++) {
			// split the current word into a key-value pair
			let [key, val] = words[i].split('=');
			// add the key-value pair to the parsed data
			resultData.users[resultData.users.length - 1].attributes[key] = val;
		}
	});

	return resultData;
}

export const dataRoute = express.Router();

dataRoute.put('/program4/data', (req, res, next) => {
	getInputFile()
	.then((data) => {
		let usersData = parseUsersData(data);
		console.log(usersData);
		uploadUsersDataToDDb(usersData);
		uploadUsersFileToS3(data)
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
