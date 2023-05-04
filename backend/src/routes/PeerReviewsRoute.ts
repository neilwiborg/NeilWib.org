import express from 'express';

export const PeerReviewsRoute = express.Router();

const peers = [
	{
		"name": "Dongin Cho",
		"studentNumber": 1
	},
	{
		"name": "Joseph Matthew Collora",
		"studentNumber": 2
	},
	{
		"name": "James Andrew Day",
		"studentNumber": 3
	},
	{
		"name": "Rachel Ann Ferrer Graham",
		"studentNumber": 4
	},
	{
		"name": "Filo Henein",
		"studentNumber": 5
	},
	{
		"name": "Mehak Kambo",
		"studentNumber": 6
	},
	{
		"name": "Safwaan Taher",
		"studentNumber": 7
	},
	{
		"name": "Cheuk-Hang Tse",
		"studentNumber": 8
	},
	{
		"name": "Neil Wiborg",
		"studentNumber": 9
	},
	{
		"name": "David Woo",
		"studentNumber": 10
	}
];

const projects = [
	{
		"name": "Project 1",
		"increment": 1
	},
	{
		"name": "Project 2",
		"increment": 2
	},
	{
		"name": "Project 3",
		"increment": 3
	},
	{
		"name": "Project 4",
		"increment": 4
	}
];

PeerReviewsRoute.get('/peerreviews', (req, res, next) => {
	res.json({"peers": peers, "projects": projects});
});
