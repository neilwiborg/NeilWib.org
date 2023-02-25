"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRoute = void 0;
const express_1 = __importDefault(require("express"));
exports.defaultRoute = express_1.default.Router();
/* GET home page. */
exports.defaultRoute.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
