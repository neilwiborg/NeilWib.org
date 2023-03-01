import express from 'express';
import { defaultRoute } from './defaultRoute';
import { dataRoute } from './program4/dataRoute';

export const routes = express.Router();

routes.use(defaultRoute);
routes.use(dataRoute);
