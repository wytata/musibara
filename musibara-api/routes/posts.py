from fastapi import APIRouter
from services.posts import createNewPost, getHomePosts, deletePost, getPost, getPostsByUserId, likePost, unlikePost 
from typing import TypedDict, List
from musibaraTypes.posts import MusibaraPostType, MusibaraPostLikeType

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

@postsRouter.get("/{postId}")
async def getPostResponse(postId: int):
    return await getPost(postId)

@postsRouter.get("/byuserid/{username}")
async def getPostsByUserIdResponse(username: str):
    return await getPostsByUserId(username)

@postsRouter.put("/new")
async def newPostResponse(post: MusibaraPostType):
    return await createNewPost(post)

@postsRouter.post("/like")
async def postLikeResponse(postLike: MusibaraPostLikeType):
    return await likePost(postLike)

@postsRouter.post("/unlike")
async def postUnlikeResponse(postUnlike: MusibaraPostLikeType):
    return await unlikePost(postUnlike)

@postsRouter.delete("/{postId}")
async def deletePostResponse(postId: int):
    return await deletePost(postId)
