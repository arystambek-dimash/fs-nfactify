import {Router} from 'express';
import usersRoute from "./routes/users-route";
import artistRoute from "./routes/artist-route";
import albumRoute from "./routes/album-route";
import trackRoute from "./routes/track-route";
import playlistsRoute from "./routes/playlists-route";

const globalRouter = Router();

globalRouter.use('/users', usersRoute)
globalRouter.use('/artists', artistRoute)
globalRouter.use('/albums', albumRoute)
globalRouter.use('/tracks', trackRoute)
globalRouter.use('/playlists', playlistsRoute)

export default globalRouter;