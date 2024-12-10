from fastapi import APIRouter
from services.likes import updatePostLikes
from typing import List, Dict, TypedDict

"""
NOTE: This is not used anywhere
"""

postsActionsRouter = APIRouter()

class PostInput(TypedDict):
    user: str
    postID: int
    like: bool

class PostOutput(TypedDict):
    postID: int
    likeCT: int


@postsActionsRouter.post("/updateLikes", tags=["Posts"], response_model=List[PostOutput])
async def batch_update_likes(data: List[PostInput]) -> List[PostOutput]:
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


