import {Router} from 'express';
import {authMiddleware} from "../middlewares/auth-middleware";
import {isAdmin} from "../middlewares/role-middleware";

import {upload} from "../services/s3-service";
import {createTrack, deleteTrack, getAlbumTracks, getTrackById, updateTrack} from "../controllers/track-controller";
import {deleteArtist} from "../controllers/artist-controller";

const router = Router();


router.post('/', authMiddleware, isAdmin, upload.fields([{name: 'image_file'}, {name: 'music_file'}]), createTrack);
router.get('/:albumId', getAlbumTracks);
router.get('/:id', getTrackById);
router.delete('/:id', authMiddleware, isAdmin, deleteTrack);
router.put('/:id', authMiddleware, isAdmin, upload.fields([{name: 'image'}, {name: 'music'}]), updateTrack);

export default router