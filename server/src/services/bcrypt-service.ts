import bcrypt from 'bcrypt';

const verifyPassword = async (password: string, dbPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, dbPassword);
    } catch (err) {
        console.error(err);
        return false;
    }
}

const hashPassword = async (password: string): Promise<string | undefined> => {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (err) {
        console.error(err);
    }
}

export {verifyPassword, hashPassword}
