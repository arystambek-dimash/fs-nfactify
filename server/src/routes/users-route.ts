import {Router} from 'express';
import {login, register, getUserProfile} from "../controllers/user-controller";
import {authMiddleware} from "../middlewares/auth-middleware";

const router = Router();

router.post('/login', login)
router.post('/register', register)
router.get('/profile/:id', authMiddleware, getUserProfile)
export default router