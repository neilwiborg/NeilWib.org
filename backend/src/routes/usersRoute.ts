import express from 'express';
export const usersRoute = express.Router();

/* GET users listing. */
usersRoute.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
