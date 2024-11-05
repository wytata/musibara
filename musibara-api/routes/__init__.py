__all__ = ["router"]

from sys import prefix
from fastapi import APIRouter
from .users import userRouter
from .posts import postsRouter
from .postComments import postCommentsRouter
from .postActions import postsActionsRouter
from .homebar import homebar_router

router = APIRouter()
router.include_router(userRouter, prefix="/api/users")
router.include_router(postsRouter, prefix="/api/posts")
router.include_router(postCommentsRouter, prefix="/api/content/postcomments")
router.include_router(postsActionsRouter, prefix="/api/content/postsActions")
router.include_router(homebar_router, prefix="/api/content")

