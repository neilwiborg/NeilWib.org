import express from 'express';
import { defaultRoute } from './defaultRoute';
import { loadDataRoute } from './loadDataRoute';

export const routes = express.Router();

routes.use(defaultRoute);
routes.use(loadDataRoute);
