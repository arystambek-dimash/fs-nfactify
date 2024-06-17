import {Document, model, Schema} from "mongoose";

interface ITrack extends Document {
    imageUrl: string;
    name: string;
    musicPath: string;
    duration: number;
    album: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}


const trackSchema: Schema = new Schema<ITrack>({
    imageUrl: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    musicPath: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: 'Album',
    }
});

const Track = model('Track', trackSchema);

export {ITrack, Track};
