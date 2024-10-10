from fastapi import APIRouter
from services.likes import updatePostLikes
from typing import List, Dict, TypedDict

"""
NOTE: These routes are prefixed with postActions/
"""

postsRouter = APIRouter()

class PostInput(TypedDict):
    user: str
    postID: int
    like: bool

class PostOutput(TypedDict):
    postID: int
    likeCT: int


@postsRouter.post("/updateLikes", response_model=List[PostOutput])
async def response(data: List[PostInput]) -> List[PostOutput]:
    """
    Update like count for posts

    Request Body:
        [
            {
                "user": str,
                "postID": int,
                "like": bool
            },
            ...
        ]

    Returns:
        [
            {
                "postID": int,
                "likeCT": int
            },
            ...
        ]
    """
    return await updatePostLikes(data) 


