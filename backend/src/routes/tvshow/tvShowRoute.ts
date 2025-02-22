import express from 'express';

export const tvShowRoute = express.Router();

type showResponseType = {
    show: {
        name: string,
        id: number,
        image?: {
            medium: string
        }
    }
}

type showType = {
    name: string,
    id: number,
    image: string
}

const getTVShows = async (searchterm: string) => {
    let endpoint = "https://api.tvmaze.com/search/shows?"  + new URLSearchParams({
                    q: searchterm
                });
    console.log(endpoint);
    let res = await fetch(endpoint);
    let resJson: showResponseType[] = await res.json();
    console.log(JSON.stringify(resJson));

    let showList: showType[] = []
    let resp = {
        shows: showList
    }

    resJson.forEach(entry => {
        let show = entry.show
        let sanitizedShow = {
            name: show.name,
            id: show.id,
            image: show.image?.medium ?? ""
        }
        resp.shows.push(sanitizedShow);
    });

    return resp
}

tvShowRoute.get('/tvshow/shows', async (req, res, next) => {
    let searchterm = req.query.searchterm as string;
    let resp = await getTVShows(searchterm);
    res.send(resp);
});
