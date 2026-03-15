import express from "express";
import type { DefaultService } from "../service/default.service.js";

type CreateDefaultApiParams = {
	defaultService: DefaultService;
};

export const createDefaultApi = ({
	defaultService,
}: CreateDefaultApiParams) => {
	const defaultApi = express.Router();

	defaultApi.get("/", (req, res) => {
		res.send(defaultService.getWelcomeMessage());
	});

	return defaultApi;
};
