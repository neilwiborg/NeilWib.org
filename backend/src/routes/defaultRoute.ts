import express from 'express';

export const defaultRoute = express.Router();

defaultRoute.get('/', (req, res, next) => {
	res.send('Welcome to Express!');
});
