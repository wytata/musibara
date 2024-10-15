__all__ = ["users"]

from fastapi import APIRouter
from .users import userRouter
from .posts import postsRouter
from .postActions import postsActionsRouter

router = APIRouter()
router.include_router(userRouter, prefix="/api/users")
router.include_router(postsRouter, prefix="/api/posts")
router.include_router(postsActionsRouter, prefix="/api/postsActions")

