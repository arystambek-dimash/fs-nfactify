import mongoose, {Document, Schema, Model} from 'mongoose';

interface IArtist extends Document {
    name: string;
    imageUrl: string;
    albums: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const artistSchema: Schema<IArtist> = new Schema<IArtist>({
    name: {type: String, required: true, unique: true},
    imageUrl: {type: String, required: false},
    albums: [{type: mongoose.Schema.Types.ObjectId, ref: 'Album'}],
}, {
    timestamps: true,
});

const ArtistModel = mongoose.model('Artist', artistSchema);

export {ArtistModel, IArtist};
