import {Router} from 'express';
import {authMiddleware} from "../middlewares/auth-middleware";
import {isAdmin} from "../middlewares/role-middleware";
import {createArtist, deleteArtist, findArtists, getArtist, updateArtist} from "../controllers/artist-controller";
import {upload} from "../services/s3-service";

const router = Router();


router.post('/', authMiddleware, isAdmin, upload.single('image-file'), createArtist)
router.get('/', findArtists)
router.get('/:id', getArtist)
router.delete('/:id', authMiddleware, isAdmin, deleteArtist);
router.put('/:id', authMiddleware, isAdmin, upload.single('image-file'), updateArtist);

export default router