__all__ = ["router"]

from sys import prefix
from fastapi import APIRouter
from .users import userRouter
from .posts import postsRouter
from .postComments import postCommentsRouter
from .postActions import postsActionsRouter
from .songs import songsRouter
from .herds import herdsRouter
from .homebar import homebar_router
from .playlists import playlistsRouter
from .artists import artistsRouter
from .albums import albumsRouter
from .notifications import notifications_router

router = APIRouter()
router.include_router(userRouter, prefix="/api/users")
router.include_router(postsRouter, prefix="/api/content/posts")
router.include_router(postCommentsRouter, prefix="/api/content/postcomments")
router.include_router(postsActionsRouter, prefix="/api/content/postsActions")
router.include_router(songsRouter, prefix="/api/songs")
router.include_router(herdsRouter, prefix="/api/herds")
router.include_router(homebar_router, prefix="/api/content")
router.include_router(playlistsRouter, prefix="/api/playlists")
router.include_router(artistsRouter, prefix="/api/artists")
router.include_router(albumsRouter, prefix="/api/albums")
router.include_router(notifications_router, prefix = "/api/users/notifications")
