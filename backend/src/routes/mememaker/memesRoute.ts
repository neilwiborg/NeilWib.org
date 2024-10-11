import express, { response } from 'express';
import { URLSearchParams } from 'url';
import {
	DynamoDBClient,
	ListExportsCommand,
	ListExportsCommandInput,
	QueryCommand,
        type QueryCommandOutput,
        type ExportSummary,
        AttributeValue
} from '@aws-sdk/client-dynamodb';
import {
        _Object,
        DeleteObjectsCommand,
        DeleteObjectsCommandInput,
        GetObjectCommand,
        GetObjectCommandOutput,
        ListObjectsV2Command,
        PutObjectCommand,
        PutObjectCommandInput,
        S3Client
} from '@aws-sdk/client-s3';
import flexsearch from 'flexsearch';
const { Index, Document, Worker  } = flexsearch;
// import { Index, Document, Worker } from 'flexsearch';
import { promisify } from 'util';
import stream from 'stream';
import { createGunzip } from 'zlib';
import jsonlines from 'jsonlines';
import app from '../../app.js';

export const memesRoute = express.Router();

const defaultRegion = 'us-west-2';
const s3Client = new S3Client({ region: defaultRegion });
const ddbClient = new DynamoDBClient({ region: defaultRegion });

const pipeline = promisify(stream.pipeline);
const index = new Document({
        document: {
                id: "id",
                index: ["title", "description", "_aka"]
        }
});

const bucketname = "neilwwebserver";

type meme = {
        id: string;
        name: string;
        url: string;
        width: number;
        height: number;
        box_count: number;
        captions: number;
};

type memeResponse = {
        data: {memes: meme[]};
};

type memeEntry = {
        id: string,
        _aka?: string[],
        _searchTitle?: string,
        description: string,
        imgflipID: number,
        templateURL: string,
        title: string
}

type entry = {
        key: string,
        values: _Object[],
        timestamp: Date | null
};

const getImgflipMeme = async (url: string) => {
	let res = await fetch(url);
	return res.blob();
};

const convertImageURLToProxy = (url: string) => {
        let urlParam = encodeURIComponent(url);
        return "https://api.neilwib.org/mememaker/meme?" + new URLSearchParams({
                url: urlParam
        });
};

const getAndUnzipJson = async (key: string, jsonData: {Item: Record<string, AttributeValue>}[]) => {
        let getParams = {
                Bucket: bucketname,
                Key: key
        };

        let resp = await s3Client.send(new GetObjectCommand(getParams));

        const gunzip = createGunzip();
        const parser = jsonlines.parse();

        parser.once('data', (obj) => {
                console.log("current json line:");
                console.log(obj);
                jsonData.push(obj);
        });

        await pipeline(resp.Body! as ReadableStream, gunzip, parser);
};

const GetExportedDataAndSanitize = async (newestEntry: entry) => {
        let promises: Promise<void>[] = []
        let jsonData: {Item: Record<string, AttributeValue>}[] = []

        newestEntry.values.forEach((entry) => {
                if (entry.Key!.endsWith(".json.gz")) {
                        promises.push(getAndUnzipJson(entry.Key!, jsonData));
                }
        });

        await Promise.all(promises);
        let transformedData = jsonData.map((entry) => {
                return entry["Item"];
        });
        console.log("transformed data:");
        console.log(transformedData);
        let sanitizedData = sanitizeQueryResponse(transformedData, true);
        return sanitizedData;
};

const SaveMostRecentTableExport = async () => {
        const tablename = "mememaker-templates";

        let listParams = {
                Bucket: bucketname,
                Prefix: "mememaker-templates/exports/AWSDynamoDB"
        };
        // list recent exports
        // TODO: handle continuation token
        let exports = await s3Client.send(new ListObjectsV2Command(listParams));

        // map all files in an export: ExportId -> array of files
        let organizedExports: Map<string, _Object[]> = new Map();
        const regex = /mememaker-templates\/exports\/AWSDynamoDB\/([0-9a-z\-]*)\/.*/;
        exports.Contents!.forEach((entry) => {
                // get the ExportId
                let key = entry.Key!.match(regex)![1];
                if (!organizedExports.has(key)) {
                        organizedExports.set(key, []);
                }

                organizedExports.get(key)!.push(entry);
        });

        // store the most recent export
        let newestEntry: entry = {key: "", values: [], timestamp: null};
        // keep track of whether there is at least one export still in-progress
        let exportsStillInProgress = false;
        // iterate over all exports
        for (let [key, value] of organizedExports) {
                let exportCompleted = false;
                // iterate over each file in the export
                value.forEach((entry) => {
                        // if the export has a manifest-summary.json, the export is completed
                        if (entry.Key!.endsWith("manifest-summary.json")) {
                                exportCompleted = true;
                                // if this is the first completed export or it's more recent than the currently saved export
                                if (newestEntry.key == "" || entry.LastModified! > newestEntry.timestamp!) {
                                        newestEntry.key = key;
                                        newestEntry.values = value;
                                        newestEntry.timestamp = entry.LastModified!;
                                }
                        }
                });
                // if the export is still in-progress
                if (!exportCompleted) {
                        exportsStillInProgress = true;
                        // remove from our hashmap since we don't need in-progress exports
                        organizedExports.delete(key);
                }
        }
        // if we found a completed export
        if (newestEntry.key != "") {
                organizedExports.delete(newestEntry.key);
        }

        let deleteParams: DeleteObjectsCommandInput = {
                Bucket: bucketname,
                Delete: {
                        Objects: []
                }
        }

        // iterate over all the old exports
        for (let [key, value] of organizedExports) {
                value.forEach((entry) => {
                        deleteParams.Delete!.Objects!.push({Key: entry.Key});
                });
        }
        // delete all the old exports
        // await s3Client.send(new DeleteObjectsCommand(deleteParams));

        let responseData = await GetExportedDataAndSanitize(newestEntry);
        console.log("all json data:");
        console.log(responseData);

        let putParams: PutObjectCommandInput = {
                ACL: "public-read",
		ContentType: "application/json",
		Bucket: bucketname,
		Key: "mememaker-templates/templates.json",
		Body: JSON.stringify({"templates": responseData})
        };

        await s3Client.send(new PutObjectCommand(putParams));
        app.locals.templates = responseData;
        app.locals.memesExportIsLatest = true;

        index.add(responseData);

        // Get newest entry's json
        // get data folder
        // unzip each file and concatonate json

        // Save newest entry's json in S3

        // Save newest entry's json in memory
};

const searchTemplates = async (query: string) => {
        let results = await index.searchAsync(query);
        console.log(index);
        console.log(results);
};

const sanitizeQueryResponse = (items: Record<string, AttributeValue>[], includePrivateFields: boolean) => {
        let sanitizedData: memeEntry[] = [];
        

        items.forEach((entry) => {
                let values = new Map();
                for (const [key, value] of Object.entries(entry)) {
                        if (includePrivateFields || (!includePrivateFields && key[0] != '_'))
                        {
                                if (value.S)
                                {
			                values.set(key, value["S"] ?? "");
                                } else if (value.N) {
                                        values.set(key, value["N"] ?? "");
                                } else if (value.SS) {
                                        values.set(key, value["SS"] ?? "");
                                }
                        }
		}
                sanitizedData.push(Object.fromEntries(values));
        });

        console.log("Sanitized data:");
        console.log(sanitizedData);

        return sanitizedData;
};

const getDDbMeme = async (id: string) => {
        const params = {
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: {
                        ':id': { S: id },
                },
                TableName: 'mememaker-templates'
        };

        let data = await ddbClient.send(new QueryCommand(params));
        return sanitizeQueryResponse(data.Items!, false);
};

const top100Memes = async () => {
        let res = await fetch("https://api.imgflip.com/get_memes");
        let resJson: memeResponse = await res.json();
        for (const m of resJson.data.memes) {
                m.url = convertImageURLToProxy(m.url);
        }
        return resJson;
};

const searchMemes = async (query: string) => {
        await SaveMostRecentTableExport();
        await searchTemplates(query);
        let topMemes = await top100Memes();
        let res: memeResponse = {data: {memes: []}};

        for (const m of topMemes.data.memes) {
                if (m.name.toLowerCase().includes(query.toLowerCase())) {
                        res.data.memes.push(m);
                }
        }
        return res;
};

memesRoute.get('/mememaker/meme', async (req, res, next) => {
        if (req.query.url)
        {
                let url = decodeURIComponent(req.query.url as string);
                let resp = await getImgflipMeme(url);

                // TODO: handle file formats
                res.set('Content-Type', 'image/jpeg');
                res.send(Buffer.from(await resp.arrayBuffer()));
        } else if (req.query.id)
        {
                let resp = await getDDbMeme(req.query.id as string);
                resp[0].templateURL = convertImageURLToProxy(resp[0].templateURL);
                res.send(resp);
        }
});

memesRoute.get('/mememaker/top100', async (req, res, next) => {
        let resp = await top100Memes();
        res.send(resp);
});

memesRoute.get('/mememaker/searchmemes', async (req, res, next) => {
        let searchterm = req.query.searchterm as string;
        let resp = await searchMemes(searchterm);
        res.send(resp);
});
