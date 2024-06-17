import mongoose from 'mongoose';
import config from "./config";

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_DB_URI || 'mongodb://localhost:27017/lecture1');
        console.log('MongoDB connected...');
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;