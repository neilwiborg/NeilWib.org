import express from 'express';
export const defaultRoute = express.Router();

/* GET home page. */
defaultRoute.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
