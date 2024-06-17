import {Request, Response} from 'express';
import mongoose from 'mongoose';
import {s3, region} from "../services/s3-service"
import {PutObjectCommand, PutObjectCommandInput, DeleteObjectCommand} from "@aws-sdk/client-s3";
import {AlbumModel, IAlbum} from "../models/album-model";
import {ArtistModel} from "../models/artist-model";

export const createAlbum = async (req: Request, res: Response): Promise<Response> => {
    const {title, artist, releaseDate} = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const params: PutObjectCommandInput = {
        Bucket: 'nfactify',
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);

        const imageUrl = `https://${params.Bucket}.s3.${region}.amazonaws.com/${params.Key}`;

        const dbArtist = await ArtistModel.findById(artist);

        if (!dbArtist) {
            return res.status(404).json({error: 'Artist not found'});
        }

        const newAlbum = new AlbumModel({
            title,
            imageUrl,
            artist: new mongoose.Types.ObjectId(artist),
            releaseDate,
            tracks: []
        });

        const savedAlbum = await newAlbum.save();

        dbArtist.albums.push(savedAlbum.id);
        await dbArtist.save();

        return res.status(201).json(savedAlbum);
    } catch (error) {
        console.error('Error creating album:', error);
        return res.status(500).json({error: 'Error creating album'});
    }
};

export const getAlbumById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const albumId = req.params.id;
        const album = await AlbumModel.findById(albumId).populate('artist').populate('tracks').exec();

        if (!album) {
            return res.status(404).json({error: 'Album not found'});
        }

        return res.status(200).json(album);
    } catch (error) {
        console.error('Error getting album:', error);
        return res.status(500).json({error: 'Error getting album'});
    }
};

export const updateAlbum = async (req: Request, res: Response): Promise<Response> => {
    const {id} = req.params;
    const {title, artist, releaseDate, tracks} = req.body;
    const file = req.file;

    try {
        const album = await AlbumModel.findById(id);
        if (!album) {
            return res.status(404).json({error: 'Album not found'});
        }

        if (file) {
            const oldKey = album.imageUrl.split('.com/')[1];
            const deleteParams = {
                Bucket: 'nfactify',
                Key: oldKey,
            };
            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3.send(deleteCommand);

            const uploadParams = {
                Bucket: 'nfactify',
                Key: file.originalname,
                Body: file.buffer,
                ContentType: file.mimetype
            };
            const uploadCommand = new PutObjectCommand(uploadParams);
            await s3.send(uploadCommand);

            album.imageUrl = `https://${uploadParams.Bucket}.s3.${region}.amazonaws.com/${uploadParams.Key}`;
        }

        if (title) album.title = title;
        if (artist) album.artist = new mongoose.Types.ObjectId(artist);
        if (releaseDate) album.releaseDate = new Date(releaseDate);
        if (tracks) album.tracks = tracks.map((trackId: string) => new mongoose.Types.ObjectId(trackId));

        const updatedAlbum = await album.save();
        return res.status(200).json(updatedAlbum);
    } catch (error) {
        console.error('Error updating album:', error);
        return res.status(500).json({error: 'Error updating album'});
    }
};

export const deleteAlbum = async (req: Request, res: Response): Promise<Response> => {
    try {
        const albumId = req.params.id;
        const album = await AlbumModel.findById(albumId);

        if (!album) {
            return res.status(404).json({error: 'Album not found'});
        }

        const key = album.imageUrl.split('.com/')[1];
        const params = {
            Bucket: 'nfactify',
            Key: key,
        };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);

        await AlbumModel.deleteOne({_id: albumId});

        return res.status(200).json({message: 'Album deleted successfully'});
    } catch (error) {
        console.error('Error deleting album:', error);
        return res.status(500).json({error: 'Error deleting album'});
    }
};

export const getArtistAlbums = async (req: Request, res: Response): Promise<Response> => {
    try {
        const artistId = req.params.artistId;
        const albums = await AlbumModel.find({artist: artistId}).populate('artist').populate('tracks').exec();

        if (!albums || albums.length === 0) {
            return res.status(404).json({error: 'No albums found for this artist'});
        }

        return res.status(200).json(albums);
    } catch (error) {
        console.error('Error getting albums by artist:', error);
        return res.status(500).json({error: 'Error getting albums by artist'});
    }
};
