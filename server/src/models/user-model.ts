import mongoose, {Document, Schema, Model} from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    playlists: mongoose.Types.ObjectId[];
    isAdmin: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    playlists: [{type: mongoose.Schema.Types.ObjectId, ref: 'Playlist'}],
    isAdmin: {type: Boolean, default: false},
}, {
    timestamps: true,
});

const UserModel = mongoose.model('User', userSchema);

export {UserModel, IUser};
