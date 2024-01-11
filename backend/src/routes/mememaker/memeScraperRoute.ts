import express from 'express';
import { JSDOM } from 'jsdom';

export const memeScraperRoute = express.Router();

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
        let pageContents = await page.text();
        const dom = new JSDOM(pageContents);
        // /meme/X querySelectors
        // let title = dom.window.document.querySelector("a.meme-link")?.getAttribute("title");
        // let templateURL = dom.window.document.querySelector("a.meme-link > img")?.getAttribute("src");
        let title = dom.window.document.querySelector("#mtm-title")!.textContent!.replace(" Meme Template", "");
        let templateURL = "https://imgflip.com" + dom.window.document.querySelector("#mtm-img")!.getAttribute("src")!;
        let subtitle = dom.window.document.querySelector("#mtm-subtitle")?.textContent;
        let aka = [];
        if (subtitle !== null && subtitle !== undefined) {
                subtitle = subtitle.replace("also called: ", "");
                let window = "";
                for (let i = 0; i < subtitle.length; i++) {
                        let c = subtitle[i];
                        if (c === ",") {
                                aka.push(window.trimStart());
                                window = "";
                        } else {
                                window += c;
                        }
                }
                aka.push(window.trimStart());
        }
        let descriptions = dom.window.document.querySelectorAll("#mtm-info > p");
        let imgflipID = -1;
        descriptions.forEach((tag) => {
                if (tag.textContent?.startsWith("Template ID")) {
                        imgflipID = parseInt(tag.textContent.replace("Template ID: ", ""));
                }
        });
        return {"title": title, "templateURL": templateURL, "aka": aka, "imgflipID": imgflipID};
};

memeScraperRoute.get('/mememaker/addmeme', async (req, res, next) => {
        let url = decodeURIComponent(req.query.url as string);
        // validate url
        let sanitizedUrl = sanitizeInputURL(url);
        let resp = await scrapeMeme(sanitizedUrl);
        res.send(resp);
});
