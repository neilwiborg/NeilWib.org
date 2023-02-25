"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const defaultRoute_1 = require("./defaultRoute");
const usersRoute_1 = require("./usersRoute");
exports.routes = express_1.default.Router();
exports.routes.use(defaultRoute_1.defaultRoute);
exports.routes.use(usersRoute_1.usersRoute);
