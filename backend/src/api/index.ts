import express from "express";
import { defaultApi } from "./default.api.js";
import { mememakerApi } from "./meme-maker.api.js";
import { photosApi } from "./photos.api.js";

export const api = express.Router();

api.use(defaultApi);
api.use(mememakerApi);
api.use(photosApi);
