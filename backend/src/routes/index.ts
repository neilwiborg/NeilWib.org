import express from 'express';
import { defaultRoute } from './defaultRoute';
import { dataRoute } from './program4/dataRoute';
import { memesRoute } from './mememaker/memesRoute';
import { PeerReviewsRoute } from './PeerReviewsRoute';

export const routes = express.Router();

routes.use(defaultRoute);
routes.use(dataRoute);
routes.use(memesRoute);
routes.use(PeerReviewsRoute);
