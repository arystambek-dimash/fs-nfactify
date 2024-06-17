import {Request, Response, NextFunction} from "express";
import {PlaylistModel} from "../models/playlist-model";

const createPlaylist = async (req: Request, res: Response, next: NextFunction) => {
    const {name} = req.body;
    const userId = (req as any).user.id;
    try {
        const dbPlaylist = await PlaylistModel.findOne({name: name});
        if (dbPlaylist) {
            return res.status(403).send({error: 'Playlist already exists'});
        }

        await PlaylistModel.create({
            name: name,
            user: userId,
            tracks: []
        });

        return res.status(200).send({message: "Playlist created successfully."});
    } catch (err) {
        console.log(err);
        return res.status(500).send({error: 'An error occurred'});
    }
};

const deletePlaylist = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const userId = (req as any).user.id;
    try {
        const playlist = await PlaylistModel.findOneAndDelete({_id: id, user: userId});
        if (!playlist) {
            return res.status(404).send({error: 'Playlist not found'});
        }
        return res.status(200).send({message: 'Playlist deleted successfully'});
    } catch (err) {
        console.log(err);
        return res.status(500).send({error: 'An error occurred'});
    }
};

const updatePlaylist = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const {name} = req.body;
    const userId = (req as any).user.id;
    try {
        const playlist = await PlaylistModel.findOneAndUpdate(
            {_id: id, user: userId},
            {name: name},
            {new: true}
        );
        if (!playlist) {
            return res.status(404).send({error: 'Playlist not found'});
        }
        return res.status(200).send({message: 'Playlist updated successfully', playlist});
    } catch (err) {
        console.log(err);
        return res.status(500).send({error: 'An error occurred'});
    }
};

const addTrackInPlaylist = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const {track} = req.body;
    const userId = (req as any).user.id;
    try {
        const playlist = await PlaylistModel.findOneAndUpdate(
            {_id: id, user: userId},
            {$push: {tracks: track}},
            {new: true}
        );
        if (!playlist) {
            return res.status(404).send({error: 'Playlist not found'});
        }
        return res.status(200).send({message: 'Track added to playlist successfully', playlist});
    } catch (err) {
        console.log(err);
        return res.status(500).send({error: 'An error occurred'});
    }
};


const getPlaylist = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    try {
        const playlist = await PlaylistModel.findById(id)
        res.status(200).send(playlist)
    } catch (err) {
        console.log(err)
    }
}
const getUserPlaylists = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params;
    try {
        const playlists = await PlaylistModel.find({user: userId}).select('name');
        return res.status(200).send({playlists});
    } catch (err) {
        console.log(err);
        return res.status(500).send({error: 'An error occurred'});
    }
};

export {createPlaylist, deletePlaylist, updatePlaylist, getPlaylist, getUserPlaylists, addTrackInPlaylist};
