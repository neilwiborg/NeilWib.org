import express from 'express';

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

const top100Memes = async () => {
	let res = await fetch("https://api.imgflip.com/get_memes");
	return res;
};

const searchMemes = async (query: string) => {
	let topMemesRes = await top100Memes();
	let topMemes = await topMemesRes.json();
	let res: memeResponse = {data: {memes: []}};

	for (const m of topMemes.data) {
		if (m.name.includes(query)) {
			res.data.memes.push(m);
		}
	}
	return res;
};

memesRoute.get('/mememaker/top100', async (req, res, next) => {
	let resp = await top100Memes();
	return resp;
});

memesRoute.get('/mememaker/searchmemes', async (req, res, next) => {
	let searchterm = req.query.searchterm as string;
	let resp = await searchMemes(searchterm);
	return resp;
});