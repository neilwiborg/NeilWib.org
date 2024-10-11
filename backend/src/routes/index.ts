import express from 'express';
import { defaultRoute } from './defaultRoute.js';
import { memesRoute } from './mememaker/memesRoute.js';
import { memeScraperRoute } from './mememaker/memeScraperRoute.js';
import { serviceRequestsRoute } from './ServiceRequests/serviceRequestsRoute.js';

export const routes = express.Router();

routes.use(defaultRoute);
routes.use(memesRoute);
routes.use(memeScraperRoute);
routes.use(serviceRequestsRoute);
