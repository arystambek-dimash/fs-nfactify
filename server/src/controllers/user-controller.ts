import express from "express";
import {hashPassword, verifyPassword} from "../services/bcrypt-service";
import {IUser, UserModel} from "../models/user-model";
import {generateJWT} from "../services/jwt-service";
import config from "../config/config";

export const login = async (req: express.Request, res: express.Response) => {
    const {email, password} = req.body;
    try {
        const dbUser: IUser | null = await UserModel.findOne({email});
        if (!dbUser) {
            return res.status(404).send("User not found");
        }
        const isPasswordValid = await verifyPassword(password, dbUser.password);
        if (!isPasswordValid) {
            return res.status(403).send("Invalid password");
        }
        const accessToken = generateJWT({id: dbUser.id, email: dbUser.email});
        const refreshToken = generateJWT({id: dbUser.id, email: dbUser.email}, config.JWT_REFRESH_TOKEN, '7d');
        res.status(200).send({
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};

export const register = async (req: express.Request, res: express.Response) => {
    const {email, name, password} = req.body;
    try {
        if (!email) {
            return res.status(400).send("Email is required");
        }

        if (!name) {
            return res.status(400).send("Name is required");
        }
        if (!password) {
            return res.status(400).send("Password is required");
        }
        if (await UserModel.findOne({email})) {
            return res.status(400).send("User already exists");
        }
        const hashedPassword = await hashPassword(password);
        const user: IUser = await UserModel.create({email, name, password: hashedPassword, playlists: []});
        const accessToken = generateJWT({id: user.id, email: user.email});
        const refreshToken = generateJWT({id: user.id, email: user.email}, config.JWT_REFRESH_TOKEN, '7d');
        res.status(201).send({
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};


export const getUserProfile = async (req: express.Request, res: express.Response) => {
    const userId = req.params.id;
    try {
        const user: IUser | null = await UserModel.findById(userId).populate('playlists', '-tracks');
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};
