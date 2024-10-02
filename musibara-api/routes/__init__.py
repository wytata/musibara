__all__ = ["users"]

from fastapi import APIRouter
from .users import userRouter


router = APIRouter()
router.include_router(userRouter)
