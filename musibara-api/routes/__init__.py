__all__ = ["users, posts"]

from fastapi import APIRouter
from .users import userRouter
from .posts import postsRouter
from .postComments import postCommentsRouter

router = APIRouter()
router.include_router(userRouter, prefix="/api/users")
router.include_router(postsRouter, prefix="/api/posts")
router.include_router(postCommentsRouter, prefix="/api/postcomments")
