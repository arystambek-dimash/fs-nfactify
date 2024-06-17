import mongoose, {Document, Schema, Model} from 'mongoose';

interface IAlbum extends Document {
    title: string;
    imageUrl: string;
    artist: mongoose.Types.ObjectId;
    releaseDate: Date;
    tracks: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const albumSchema: Schema<IAlbum> = new Schema<IAlbum>({
    title: {type: String, required: true},
    imageUrl: {type: String, required: false},
    artist: {type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true},
    releaseDate: {type: Date, required: true},
    tracks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Track'}]
}, {
    timestamps: true,
});

const AlbumModel = mongoose.model('Album', albumSchema);

export {AlbumModel, IAlbum};
