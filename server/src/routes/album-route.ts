import {Router} from 'express';
import {authMiddleware} from "../middlewares/auth-middleware";
import {isAdmin} from "../middlewares/role-middleware";

import {upload} from "../services/s3-service";
import {createAlbum, deleteAlbum, getAlbumById, getArtistAlbums, updateAlbum} from "../controllers/album-controller";

const router = Router();


router.post('/', authMiddleware, isAdmin, upload.single('image-file'), createAlbum)
router.get('/:artistId', getArtistAlbums)
router.get('/:id', getAlbumById)
router.delete('/:id', authMiddleware, isAdmin, deleteAlbum);
router.put('/:id', authMiddleware, isAdmin, upload.single('image-file'), updateAlbum);

export default router