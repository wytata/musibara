from fastapi import APIRouter, Request
from services.postTags import set_post_tag
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

@postsRouter.post("/dummytag")
async def dummy(request: Request):
    data = await request.json()
    return await set_post_tag(data['tags'], data['post_id'])
