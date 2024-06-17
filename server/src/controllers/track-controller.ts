import {Request, Response} from 'express';
import mongoose, {Types} from 'mongoose';
import {s3, region} from "../services/s3-service";
import {PutObjectCommand, PutObjectCommandInput, DeleteObjectCommand} from "@aws-sdk/client-s3";
import {ITrack, Track} from "../models/track-model";
import {AlbumModel} from "../models/album-model";

export const createTrack = async (req: Request, res: Response): Promise<Response> => {
    const {name, duration, album} = req.body;
    const imageFile = (req.files as any)?.image_file?.[0];
    const musicFile = (req.files as any)?.music_file?.[0];

    if (!imageFile || !musicFile) {
        return res.status(400).send('Image or music file not uploaded');
    }

    const imageParams: PutObjectCommandInput = {
        Bucket: 'nfactify',
        Key: imageFile.originalname,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype
    };

    const musicParams: PutObjectCommandInput = {
        Bucket: 'nfactify',
        Key: musicFile.originalname,
        Body: musicFile.buffer,
        ContentType: musicFile.mimetype
    };

    try {
        const imageCommand = new PutObjectCommand(imageParams);
        const musicCommand = new PutObjectCommand(musicParams);
        await s3.send(imageCommand);
        await s3.send(musicCommand);

        const imageUrl = `https://${imageParams.Bucket}.s3.${region}.amazonaws.com/${imageParams.Key}`;
        const musicPath = `https://${musicParams.Bucket}.s3.${region}.amazonaws.com/${musicParams.Key}`;

        const newTrack = new Track({
            imageUrl,
            name,
            musicPath,
            duration,
            album: new Types.ObjectId(album)
        });

        const savedTrack = await newTrack.save();

        const dbAlbum = await AlbumModel.findById(album);
        if (dbAlbum) {
            dbAlbum.tracks.push(savedTrack.id);
            await dbAlbum.save();
        }

        return res.status(201).json(savedTrack);
    } catch (error) {
        console.error('Error creating track:', error);
        return res.status(500).json({error: 'Error creating track'});
    }
};

export const getTrackById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const trackId = req.params.id;
        const track = await Track.findById(trackId).populate('album').exec();

        if (!track) {
            return res.status(404).json({error: 'Track not found'});
        }

        return res.status(200).json(track);
    } catch (error) {
        console.error('Error getting track:', error);
        return res.status(500).json({error: 'Error getting track'});
    }
};

export const updateTrack = async (req: Request, res: Response): Promise<Response> => {
    const {id} = req.params;
    const {name, duration, album} = req.body;
    const imageFile = (req.files as any)?.image?.[0];
    const musicFile = (req.files as any)?.music?.[0];

    try {
        const track = await Track.findById(id) as ITrack;
        if (!track) {
            return res.status(404).json({error: 'Track not found'});
        }

        if (imageFile) {
            const oldImageKey = track.imageUrl.split('.com/')[1];
            const deleteImageParams = {
                Bucket: 'nfactify',
                Key: oldImageKey,
            };
            const deleteImageCommand = new DeleteObjectCommand(deleteImageParams);
            await s3.send(deleteImageCommand);

            const imageUploadParams = {
                Bucket: 'nfactify',
                Key: imageFile.originalname,
                Body: imageFile.buffer,
                ContentType: imageFile.mimetype
            };
            const imageUploadCommand = new PutObjectCommand(imageUploadParams);
            await s3.send(imageUploadCommand);

            track.imageUrl = `https://${imageUploadParams.Bucket}.s3.${region}.amazonaws.com/${imageUploadParams.Key}`;
        }

        if (musicFile) {
            const oldMusicKey = track.musicPath.split('.com/')[1];
            const deleteMusicParams = {
                Bucket: 'nfactify',
                Key: oldMusicKey,
            };
            const deleteMusicCommand = new DeleteObjectCommand(deleteMusicParams);
            await s3.send(deleteMusicCommand);

            const musicUploadParams = {
                Bucket: 'nfactify',
                Key: musicFile.originalname,
                Body: musicFile.buffer,
                ContentType: musicFile.mimetype
            };
            const musicUploadCommand = new PutObjectCommand(musicUploadParams);
            await s3.send(musicUploadCommand);

            track.musicPath = `https://${musicUploadParams.Bucket}.s3.${region}.amazonaws.com/${musicUploadParams.Key}`;
        }

        if (name) track.name = name;
        if (duration) track.duration = duration;
        if (album) track.album = album;

        const updatedTrack = await track.save();
        return res.status(200).json(updatedTrack);
    } catch (error) {
        console.error('Error updating track:', error);
        return res.status(500).json({error: 'Error updating track'});
    }
};

export const deleteTrack = async (req: Request, res: Response): Promise<Response> => {
    try {
        const trackId = req.params.id;
        const track = await Track.findById(trackId) as ITrack;

        if (!track) {
            return res.status(404).json({error: 'Track not found'});
        }

        const imageKey = track.imageUrl.split('.com/')[1];
        const musicKey = track.musicPath.split('.com/')[1];

        const deleteImageParams = {
            Bucket: 'nfactify',
            Key: imageKey,
        };
        const deleteImageCommand = new DeleteObjectCommand(deleteImageParams);
        await s3.send(deleteImageCommand);

        const deleteMusicParams = {
            Bucket: 'nfactify',
            Key: musicKey,
        };
        const deleteMusicCommand = new DeleteObjectCommand(deleteMusicParams);
        await s3.send(deleteMusicCommand);

        await Track.deleteOne({_id: trackId});

        return res.status(200).json({message: 'Track deleted successfully'});
    } catch (error) {
        console.error('Error deleting track:', error);
        return res.status(500).json({error: 'Error deleting track'});
    }
};

export const getAlbumTracks = async (req: Request, res: Response): Promise<Response> => {
    try {
        const albumId = req.params.albumId;
        const tracks = await Track.find({album: albumId}).populate('album').exec();

        if (!tracks || tracks.length === 0) {
            return res.status(404).json({error: 'No tracks found for this album'});
        }

        return res.status(200).json(tracks);
    } catch (error) {
        console.error('Error getting tracks by album:', error);
        return res.status(500).json({error: 'Error getting tracks by album'});
    }
};