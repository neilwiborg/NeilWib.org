import express from 'express';
import { chromium } from 'playwright';

export const memeScraperRoute = express.Router();

const scrapeMeme = async (imgflipUrl: string) => {
        const browser = await chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto(imgflipUrl);

        const loc = page.locator("a.meme-link").first();
        const title = loc.getAttribute("title");
        await browser.close();
        return title;
};

memeScraperRoute.get('/mememaker/addmeme', async (req, res, next) => {
        let url = decodeURIComponent(req.query.url as string);
        // validate url
        let title = await scrapeMeme(url);
        res.send({"title": title});
});
