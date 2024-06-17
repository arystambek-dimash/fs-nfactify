import express from "express";
import bodyParser from "body-parser";
import http from "node:http";
import {Server} from 'socket.io';

import config from "./config/config";
import globalRouter from "./routes";
import connectDB from "./config/db";
import {UserModel} from "./models/user-model";
import {Track} from "./models/track-model";

const port = config.PORT || 3000;
const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(bodyParser.json());
app.use('/api/v1', globalRouter);

connectDB();

io.on('connection', (socket) => {
    console.log("User connected");

    socket.on('whoKnowListenMusic', async (userId, musicId) => {
        try {
            const user = await UserModel.findById(userId).select('name');
            const music = await Track.findById(musicId).select('name');

            if (user && music) {
                socket.broadcast.emit('musicActivity', {
                    userName: user.name,
                    musicName: music.name
                });
            }
        } catch (error) {
            console.error("Error fetching user or music:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log("User disconnected");
    });
});

server.listen(port, () => {
    console.log("Server started on port http://localhost:" + port);
});
