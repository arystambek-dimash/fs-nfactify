import express from 'express';
import {ArtistModel} from '../models/artist-model';
import {region, s3} from "../services/s3-service";
import {DeleteObjectCommand, PutObjectCommand, PutObjectCommandInput} from "@aws-sdk/client-s3";

export const createArtist = async (req: express.Request, res: express.Response) => {
    const {name} = req.body;
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
        console.log(`S3 Client Region: ${region}`);

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const imageUrl = `https://${params.Bucket}.s3.${region}.amazonaws.com/${params.Key}`;
        console.log(`Image URL: ${imageUrl}`);

        const artist = new ArtistModel({
            name,
            imageUrl,
            albums: [],
        });

        await artist.save();

        res.status(201).send(artist);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};

export const deleteArtist = async (req: express.Request, res: express.Response) => {
    const {id} = req.params;

    try {
        const artist = await ArtistModel.findById(id);
        if (!artist) {
            return res.status(404).send('Artist not found');
        }

        const key = artist.imageUrl.split('.com/')[1];
        const params = {
            Bucket: 'nfactify',
            Key: key,
        };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);

        // Delete artist from database
        await ArtistModel.deleteOne({_id: id});

        res.status(200).send('Artist deleted');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};

export const updateArtist = async (req: express.Request, res: express.Response) => {
    const {id} = req.params;
    const {name} = req.body;
    const file = req.file;


    try {
        const artist = await ArtistModel.findById(id);
        if (!artist) {
            return res.status(404).send('Artist not found');
        }

        if (file) {
            const oldKey = artist.imageUrl.split('.com/')[1];
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

            // Update artist's imageUrl
            artist.imageUrl = `https://${uploadParams.Bucket}.s3.${region}.amazonaws.com/${uploadParams.Key}`;
        }

        if (name) {
            artist.name = name;
        }

        await artist.save();

        res.status(200).send(artist);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


export const getArtist = async (req: express.Request, res: express.Response) => {
    const {id} = req.params;

    try {
        const artist = await ArtistModel.findById(id);
        if (!artist) {
            return res.status(404).send('Artist not found');
        }

        res.status(200).send(artist);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


export const findArtists = async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        const name: string = req.query.name as string;
        if (!name) {
            throw new Error("Name query parameter is required");
        }

        const artist = await ArtistModel.findOne({name: {$regex: name, $options: 'i'}}).exec();
        return res.status(200).json(artist);
    } catch (error) {
        console.error('Error finding artist:', error);
        return res.status(500).json({error: 'Error finding artist'});
    }
}
