import express from "express";
import { defaultRoute } from "./defaultRoute.js";
import { memeScraperRoute } from "./mememaker/memeScraperRoute.js";
import { memesRoute } from "./mememaker/memesRoute.js";
import { photosRoute } from "./photos/photosRoute.js";

export const routes = express.Router();

routes.use(defaultRoute);
routes.use(memesRoute);
routes.use(memeScraperRoute);
routes.use(photosRoute);
