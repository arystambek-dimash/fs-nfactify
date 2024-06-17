import {Router} from 'express';
import {authMiddleware} from "../middlewares/auth-middleware";

import {
    createPlaylist,
    deletePlaylist,
    getPlaylist,
    getUserPlaylists,
    updatePlaylist
} from "../controllers/playlists-controller";

const router = Router();


router.post('/', authMiddleware, createPlaylist)
router.get('/:id', getUserPlaylists)
router.get('/:id', getPlaylist)
router.delete('/:id', authMiddleware, deletePlaylist);
router.put('/:id', authMiddleware, updatePlaylist);

export default router