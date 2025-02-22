import express from 'express';
import { defaultRoute } from './defaultRoute';
import { memesRoute } from './mememaker/memesRoute';
import { memeScraperRoute } from './mememaker/memeScraperRoute';
import { photosRoute } from './photos/photosRoute';

export const routes = express.Router();

routes.use(defaultRoute);
routes.use(memesRoute);
routes.use(memeScraperRoute);
routes.use(photosRoute);