import express from 'express';
import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, type BatchWriteItemCommandInput, BatchWriteItemCommand, WriteRequest, DeleteTableCommand, CreateTableCommand, DynamoDB, waitUntilTableNotExists } from "@aws-sdk/client-dynamodb";
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

const deleteUsersDataFromS3 = async () => {
	const bucketName = "neilwwebserver";
	const s3Filename = "userDataText.txt";
	const bucketParams = {
		Bucket: bucketName,
		Key: s3Filename
	};

	s3Client.send(new DeleteObjectCommand(bucketParams));
}

const waitUntilTableDeleted = async () => {
	const tableName = "webserverUsersData";
	const waiterParams = {
		client: ddbClient,
		maxWaitTime: 120
	};
	const params = {
		TableName: tableName
	};
	return await waitUntilTableNotExists(waiterParams, params)
	.then((resp) => {resp});
}

const deleteDDbTable = async () => {
	const tableName = "webserverUsersData";
	const params = {
		TableName: tableName
	  };

	return await ddbClient.send(new DeleteTableCommand(params))
	.then((data) => {
		waitUntilTableDeleted()
		.then((waitResp) => waitResp)
	});
}

const createDDbTable = async () => {
	const tableName = "webserverUsersData";

	const params = {
		AttributeDefinitions: [
			{
			  AttributeName: "lastName",
			  AttributeType: "S"
			},
			{
			  AttributeName: "firstName",
			  AttributeType: "S"
			},
		  ],
		KeySchema: [
			{
			  AttributeName: "lastName",
			  KeyType: "HASH"
			},
			{
			  AttributeName: "firstName",
			  KeyType: "RANGE"
			}
		  ],
		  ProvisionedThroughput: {
			ReadCapacityUnits: 1,
			WriteCapacityUnits: 1,
		  },
		TableName: tableName
	}

	return await ddbClient.send(new CreateTableCommand(params))
	.then((data) => {data});
}

const parseUsersData = (usersData: string) => {
	// remove extra whitespace
	usersData = usersData.replace(/  +/g, ' ').trim();
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
		uploadUsersDataToDDb(usersData);
		uploadUsersFileToS3(data)
		.then((resp) => {
			res.send(resp);
		})
	});
});

dataRoute.delete('/program4/data', (req, res, next) => {
	deleteUsersDataFromS3()
	.then((s3DeleteResp) => {
		deleteDDbTable()
		.then((ddbDeleteResp) => {
			createDDbTable()
			.then((ddbCreateResp) => {
				res.send("Delete request fulfilled");
			})
		})
	})
});

dataRoute.get('/program4/data', (req, res, next) => {
	res.send(JSON.stringify(usersData));
});
