__all__ = ["users"]

from fastapi import APIRouter
from .users import userRouter
from .posts import postsRouter

router = APIRouter()
router.include_router(userRouter)
router.include_router(postsRouter, prefix="/posts")
