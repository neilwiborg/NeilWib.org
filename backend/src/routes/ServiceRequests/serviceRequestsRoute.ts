import express from 'express';
import { URLSearchParams } from 'url';

export const serviceRequestsRoute = express.Router();


serviceRequestsRoute.get('/ServiceRequests/cities', async (req, res, next) => {

});

serviceRequestsRoute.get('/ServiceRequests', async (req, res, next) => {
        let city = req.query.city as string;
});
