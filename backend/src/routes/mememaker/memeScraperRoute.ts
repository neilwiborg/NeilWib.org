import { randomUUID } from 'crypto';
import express from 'express';
import { JSDOM } from 'jsdom';
import { AttributeValue, DynamoDBClient, PutItemCommand, PutItemCommandInput, ScanCommand } from '@aws-sdk/client-dynamodb';

export const memeScraperRoute = express.Router();

const defaultRegion = 'us-west-2';
const ddbClient = new DynamoDBClient({ region: defaultRegion });

type scrapedImgflipData = {
        "title": string,
        "templateURL": string,
        "aka": string[],
        "imgflipID": number,
        "description": string,
};

const sanitizeInputURL = (imgflipUrl: string) => {
        const regex = /https:\/\/imgflip.com\/(?:meme(?:template|generator)?)\/(.*)/;

        let regexMatches = imgflipUrl.match(regex);
        if (regexMatches === null || regexMatches.length < 2) {
                return "";
        }

        let sanitizedPath = "https://imgflip.com/memetemplate/" + regexMatches[1];
        return sanitizedPath;
};

const scrapeMeme = async (imgflipUrl: string) => {
        let page = await fetch(imgflipUrl);
        if (!page.ok) {
                return null;
        }
        let pageContents = await page.text();
        const dom = new JSDOM(pageContents);
        // /meme/X querySelectors
        // let title = dom.window.document.querySelector("a.meme-link")?.getAttribute("title");
        // let templateURL = dom.window.document.querySelector("a.meme-link > img")?.getAttribute("src");
        let title = dom.window.document.querySelector("#mtm-title")?.textContent //.replace(" Meme Template", "");
        if (title !== null && title !== undefined) {
                if (title.endsWith(" Meme Template")) {
                        title = title.replace(" Meme Template", "");
                } else if (title.endsWith(" Template")) {
                        title = title.replace(" Template", "");
                }
        }
        let templateURL = dom.window.document.querySelector("#mtm-img")?.getAttribute("src");
        if (templateURL !== null && templateURL !== undefined) {
                if (templateURL.startsWith("//")) {
                        templateURL = "https:" + templateURL;
                } else if (templateURL.startsWith("/")) {
                        templateURL = "https://imgflip.com" + templateURL;
                }
        }
        let subtitle = dom.window.document.querySelector("#mtm-subtitle")?.textContent;
        let aka = [];
        if (subtitle !== null && subtitle !== undefined) {
                subtitle = subtitle.replace("also called: ", "");
                let window = "";
                for (let i = 0; i < subtitle.length; i++) {
                        let c = subtitle[i];
                        if (c === ",") {
                                aka.push(window.trimStart().toLowerCase());
                                window = "";
                        } else {
                                window += c;
                        }
                }
                aka.push(window.trimStart().toLowerCase());
        }
        let description = dom.window.document.querySelector("#mtm-description")?.textContent ?? "";
        let properties = dom.window.document.querySelectorAll("#mtm-info > p");
        let imgflipID = -1;
        properties.forEach((tag) => {
                if (tag.textContent?.startsWith("Template ID")) {
                        imgflipID = parseInt(tag.textContent.replace("Template ID: ", ""));
                }
        });
        if (title === null || title === undefined
                || templateURL === null || templateURL === undefined
                || imgflipID === -1) {
                        return null;
                }
        return {"title": title, "templateURL": templateURL, "aka": aka, "imgflipID": imgflipID, "description": description};
};

const addToDB = async (imgflipData: scrapedImgflipData) => {
        const tablename = "mememaker-templates";
        let id = randomUUID();

        let item: Record<string, AttributeValue> = {
                "id": {"S": id},
                "title": {"S": imgflipData.title},
                "templateURL": {"S": imgflipData.templateURL},
                "imgflipID": {"N": imgflipData.imgflipID.toString()},
                "description": {"S": imgflipData.description},
                "_aka": {"SS": imgflipData.aka},
                "_searchTitle": {"S": imgflipData.title.toLowerCase()} // TODO: remove punctuation
        };

        const params: PutItemCommandInput = {
                "TableName": tablename,
                "Item": item
        };

        // do scan (add GSI?) to check for imgflipID already existing in table
        const scanParams = {
                FilterExpression: 'imgflipID = :imgflipID',
                ExpressionAttributeValues: {
                        ':imgflipID': {"N": imgflipData.imgflipID.toString()}
                },
                TableName: tablename
        }
        let scanResp = await ddbClient.send(new ScanCommand(scanParams));
        if (scanResp.Items === undefined || scanResp.Items.length === undefined) {
                return {"message": "ErrorAddingMeme"};
        }
        if (scanResp.Items?.length > 0) {
                return {"message": "AlreadyExists",
                        "id": scanResp.Items[0].id["S"]};
        }

        let resp = await ddbClient.send(new PutItemCommand(params));
        return resp;
};

memeScraperRoute.get('/mememaker/addmeme', async (req, res, next) => {
        if (req.query.url === undefined) {
                res.status(400).send("No URL provided");
        }
        let url = decodeURIComponent(req.query.url as string);
        // validate url
        let sanitizedUrl = sanitizeInputURL(url);
        if (sanitizedUrl === "") {
                res.status(400).send("Invalid URL");
        }
        let imgflipData: scrapedImgflipData | null = await scrapeMeme(sanitizedUrl);
        if (imgflipData === null) {
                res.status(400).send("Invalid URL");
        }
        let dbResp = await addToDB(imgflipData!);
        res.send(dbResp);
});
