import express from 'express';
import {verifyJWT} from '../services/jwt-service';
import config from '../config/config';

const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    try {
        (req as any).user = await verifyJWT(token);
        next();
    } catch (error) {
        console.error(error);
        res.status(401).send('Invalid token.');
    }
};

export {authMiddleware};
