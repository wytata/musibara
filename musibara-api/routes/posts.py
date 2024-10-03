from fastapi import APIRouter
from services.posts import getHomePosts
from typing import TypedDict, List

"""
NOTE: This route is prefixed with posts/
"""
postsRouter = APIRouter()

class PostType(TypedDict):
    user: str
    timestamp: str
    content: str
    likes: int
    comments: int 

@postsRouter.get("/home", response_model=List[PostType])
async def response() -> List[PostType]:
    """
    Retrieve home posts.
    
    Returns:
        List[PostType]: A list of posts.
    """
    return await getHomePosts()

