import express from 'express';
import { URLSearchParams } from 'url';

export const memesRoute = express.Router();

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

const getImgflipMeme = async (url: string) => {
	let res = await fetch(url);
	return res.blob();
};

const top100Memes = async () => {
        let res = await fetch("https://api.imgflip.com/get_memes");
		let resJson: memeResponse = await res.json();
		for (const m of resJson.data.memes) {
			let urlParam = encodeURIComponent(m.url);
			m.url = "https://api.neilwib.org/mememaker/meme" + new URLSearchParams({
				url: urlParam
			});
		}
        return resJson;
};

const searchMemes = async (query: string) => {
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
	let url = decodeURIComponent(req.query.url as string);
	let resp = await getImgflipMeme(url);

	res.set('Content-Type', 'image/jpeg');
	res.send(Buffer.from(await resp.arrayBuffer()));
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
