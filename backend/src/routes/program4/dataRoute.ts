import express from 'express';

export const dataRoute = express.Router();

// import userData from './data/ddb_example.json';
let userData = {
	users: [
		{
			lastName: 'Bowie',
			firstName: 'David',
			age: 58,
			id: 8765
		},
		{
			lastName: 'Byrne',
			firstName: 'David',
			age: 55,
			id: 879897
		},
		{
			lastName: 'Cassidy',
			firstName: 'David',
			happy: true,
			id: 765
		},
		{
			lastName: 'Strummer',
			firstName: 'Joe',
			age: 'ageless',
			id: 1
		},
		{
			lastName: 'Costello',
			firstName: 'Elvis',
			age: 61,
			album: 'MyAim'
		}
	]
};

dataRoute.put('/program4/data', (req, res, next) => {
	res.send("Put request fulfilled");
});

dataRoute.delete('/program4/data', (req, res, next) => {
	res.send("Delete request fulfilled");
});

dataRoute.get('/program4/data', (req, res, next) => {
	res.send(JSON.stringify(userData));
});