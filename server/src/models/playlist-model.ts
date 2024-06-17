import mongoose, {Document, Schema, Model} from 'mongoose';

interface IPlaylist extends Document {
    name: string;
    user: mongoose.Types.ObjectId;
    tracks: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const playlistSchema: Schema<IPlaylist> = new Schema<IPlaylist>({
    name: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    tracks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Track'}]
}, {
    timestamps: true,
});

const PlaylistModel  = mongoose.model('Playlist', playlistSchema);

export {PlaylistModel, IPlaylist};
