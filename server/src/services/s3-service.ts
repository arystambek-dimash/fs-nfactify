import multer from 'multer';
import {S3Client} from "@aws-sdk/client-s3";
import dotenv from 'dotenv';


dotenv.config();

export const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY || '';
const secretAccessKey = process.env.AWS_SECRET_KEY || '';

console.log(`AWS Region: ${region}`);
console.log(`AWS Access Key ID: ${accessKeyId ? '******' : 'Not Provided'}`);
console.log(`AWS Secret Access Key: ${secretAccessKey ? '******' : 'Not Provided'}`);

export const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});


const storage = multer.memoryStorage();
export const upload = multer({storage: storage});