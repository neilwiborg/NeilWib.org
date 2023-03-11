import express from 'express';
import {
	S3Client,
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand
} from '@aws-sdk/client-s3';
import {
	DynamoDBClient,
	type BatchWriteItemCommandInput,
	BatchWriteItemCommand,
	WriteRequest,
	DeleteTableCommand,
	CreateTableCommand,
	waitUntilTableNotExists,
	waitUntilTableExists,
	QueryCommand,
	ScanCommand
} from '@aws-sdk/client-dynamodb';

const defaultRegion = 'us-west-2';
const s3Client = new S3Client({ region: defaultRegion });
const ddbClient = new DynamoDBClient({ region: defaultRegion });

type user = {
	lastName: string;
	firstName: string;
	attributes: Record<string, string>;
};

type data = {
	users: user[];
};

type formattedOutput = {
	users: Record<string, string>[];
};

const getInputFile = async () => {
	const bucketName = 'css490';
	const s3Filename = 'input.txt';
	const bucketParams = {
		Bucket: bucketName,
		Key: s3Filename
	};

	let resp = await s3Client.send(new GetObjectCommand(bucketParams));
	let data = await resp.Body!.transformToString();
	return data;
};

const uploadUsersFileToS3 = async (usersData: string) => {
	const bucketName = 'neilwwebserver';
	const s3Filename = 'userDataText.txt';
	const bucketParams = {
		ACL: 'public-read',
		ContentType: 'text/plain',
		Bucket: bucketName,
		Key: s3Filename,
		Body: usersData
	};

	let resp = await s3Client.send(new PutObjectCommand(bucketParams));
	return resp;
};

const uploadUsersDataToDDb = async (usersData: data) => {
	const tableName = 'webserverUsersData';
	let batchCount = 0;
	const params: BatchWriteItemCommandInput = {
		RequestItems: {
			[tableName]: []
		}
	};
	usersData.users.forEach(async (item) => {
		const itemProps: WriteRequest = {
			PutRequest: {
				Item: {
					lastName: { S: item.lastName },
					firstName: { S: item.firstName }
				}
			}
		};

		for (let key in item.attributes) {
			itemProps.PutRequest!.Item![key] = { S: item.attributes[key] };
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
};

const deleteUsersDataFromS3 = async () => {
	const bucketName = 'neilwwebserver';
	const s3Filename = 'userDataText.txt';
	const bucketParams = {
		Bucket: bucketName,
		Key: s3Filename
	};

	let resp = await s3Client.send(new DeleteObjectCommand(bucketParams));
	return resp;
};

const waitUntilTableDeleted = async () => {
	const tableName = 'webserverUsersData';
	const waiterParams = {
		client: ddbClient,
		maxWaitTime: 120
	};
	const params = {
		TableName: tableName
	};
	let resp = await waitUntilTableNotExists(waiterParams, params);
	return resp;
};

const waitUntilTableCreated = async () => {
	const tableName = 'webserverUsersData';
	const waiterParams = {
		client: ddbClient,
		maxWaitTime: 120
	};
	const params = {
		TableName: tableName
	};
	let resp =  await waitUntilTableExists(waiterParams, params);
	return resp;
};

const deleteDDbTable = async () => {
	const tableName = 'webserverUsersData';
	const params = {
		TableName: tableName
	};

	let resp = await ddbClient.send(new DeleteTableCommand(params));
	return resp;
};

const createDDbTable = async () => {
	const tableName = 'webserverUsersData';

	const params = {
		AttributeDefinitions: [
			{
				AttributeName: 'lastName',
				AttributeType: 'S'
			},
			{
				AttributeName: 'firstName',
				AttributeType: 'S'
			}
		],
		KeySchema: [
			{
				AttributeName: 'lastName',
				KeyType: 'HASH'
			},
			{
				AttributeName: 'firstName',
				KeyType: 'RANGE'
			}
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 1,
			WriteCapacityUnits: 1
		},
		TableName: tableName
	};

	let resp = await ddbClient.send(new CreateTableCommand(params));
	return resp;
};

const parseUsersData = (usersData: string) => {
	// remove extra whitespace
	usersData = usersData.replace(/\t/g, ' ').replace(/  +/g, ' ').trim();
	// split into array of lines
	let lines = usersData.split('\r\n');

	// hold the parsed data
	let resultData: data = {
		users: []
	};

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
};

const queryUsersData = async (firstName: string, lastName: string) => {
	if (firstName != '' && lastName != '') {
		const params = {
			KeyConditionExpression: 'lastName = :lastName AND firstName = :firstName',
			ExpressionAttributeValues: {
				':lastName': { S: lastName },
				':firstName': { S: firstName }
			},
			TableName: 'webserverUsersData'
		};

		let data = await ddbClient.send(new QueryCommand(params));
		return data;
	} else if (firstName != '') {
		const params = {
			FilterExpression: 'firstName = :firstName',
			ExpressionAttributeValues: {
				':firstName': { S: firstName }
			},
			TableName: 'webserverUsersData'
		};

		let data = await ddbClient.send(new ScanCommand(params));
		return data;
	} else {
		const params = {
			KeyConditionExpression: 'lastName = :lastName',
			ExpressionAttributeValues: {
				':lastName': { S: lastName }
			},
			TableName: 'webserverUsersData'
		};

		let data = await ddbClient.send(new QueryCommand(params));
		return data;
	}
};

export const dataRoute = express.Router();

dataRoute.put('/program4/data', async (req, res, next) => {
	let inputFile = await getInputFile();
	let usersData = parseUsersData(inputFile);
	await uploadUsersFileToS3(inputFile);
	await uploadUsersDataToDDb(usersData);
	res.send("Data loaded");
});

dataRoute.delete('/program4/data', async (req, res, next) => {
	await deleteUsersDataFromS3();
	await deleteDDbTable();
	await waitUntilTableDeleted();
	await createDDbTable();
	await waitUntilTableCreated();
	res.send('Delete request fulfilled');
});

dataRoute.get('/program4/data', async (req, res, next) => {
	let firstName = req.query.firstName as string;
	let lastName = req.query.lastName as string;
	let queryResponse = await queryUsersData(firstName, lastName);
	let formattedResponse: formattedOutput = {
		users: []
	}
	queryResponse.Items?.forEach((entry) => {
		let user: Record<string, string> = {}
		for (const [key, value] of Object.entries(entry)) {
			user[key] = value["S"] ?? "";
		}
		formattedResponse.users.push(user);
	});
	res.send(JSON.stringify(formattedResponse));
});
