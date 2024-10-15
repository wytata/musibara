from fastapi import APIRouter
from services.posts import createNewPost, getHomePosts, deletePost 
from typing import TypedDict, List
from musibaraTypes.posts import MusibaraPostType

"""
NOTE: This route is prefixed with posts/
"""
postsRouter = APIRouter()

@postsRouter.get("/home", response_model=List[MusibaraPostType])
async def response() -> List[MusibaraPostType]:
    """
    Retrieve home posts.
    
    Returns:
        List[MusibaraPostType]: A list of posts.
    """
    return await getHomePosts()

@postsRouter.put("/new")
async def newPostResponse(post: MusibaraPostType):
    return await createNewPost(post)

@postsRouter.delete("/{postId}")
async def deletePostResponse(postId: int):
    return await deletePost(postId)
