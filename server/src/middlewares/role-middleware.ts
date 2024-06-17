import express from 'express';
import { IUser, UserModel } from '../models/user-model';

export const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = (req as any).user.id;
    try {
        const user: IUser | null = await UserModel.findById(userId);
        if (user && user.isAdmin) {
            next();
        } else {
            res.status(403).send('Access denied, admin only');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};
