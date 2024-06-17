import jwt from 'jsonwebtoken';
import config from "../config/config";

const generateJWT = (payload: object, secretKey: string = config.JWT_ACCESS_TOKEN || "Hello", exp: string = '3h'): string => {
    return jwt.sign(payload, secretKey, {expiresIn: exp});
};

const verifyJWT = async (token: string, secretKey: string = config.JWT_ACCESS_TOKEN || "Hello"): Promise<any> => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        throw new Error('Invalid token');
    }
};


export {generateJWT, verifyJWT}
