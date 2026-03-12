import express from "express";
import { getWelcomeMessage } from "../service/default.service.js";

export const defaultApi = express.Router();

defaultApi.get("/", (req, res) => {
	res.send(getWelcomeMessage());
});
