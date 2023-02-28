import express from 'express';
export const defaultRoute = express.Router();

/* GET home page. */
defaultRoute.get('/', (req, res, next) => {
	res.send(req.ip);
});
