from fastapi import APIRouter, Request
from services.posts import createNewPost, getHomePosts, deletePost, getPost, getPostsByUsername, likePost, unlikePost, getIsLiked 
from typing import TypedDict, List
from musibaraTypes.posts import MusibaraPostType, MusibaraPostLikeType
from services.user_auth import get_id_username_from_cookie
from fastapi.responses import JSONResponse
from starlette.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED

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

@postsRouter.get("/me")
async def getPostsOfUserResponse(request: Request):
    username = get_id_username_from_cookie(request)[1]
    print(username)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})
    
    return await getPostsByUsername(username)

@postsRouter.put("/new")
async def newPostResponse(post: MusibaraPostType):
    return await createNewPost(post)

@postsRouter.get("/isLiked/{postid}")
async def getIsLikedResponse(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    isLiked = await getIsLiked(user_id, request.get("postid"))
    return {"isLiked": isLiked}

@postsRouter.post("/like")
async def postLikeResponse(request: Request):
    #postLike: MusibaraPostLikeType
    print("request: ", request)
    print(request.cookies)
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    print(user_id)
    print(data)
    postLike = MusibaraPostLikeType(userid=user_id, postid = data['postid'])
    return await likePost(postLike)

@postsRouter.post("/unlike")
async def postUnlikeResponse(postUnlike: MusibaraPostLikeType):
    return await unlikePost(postUnlike)

#@postsRouter.get("/") # getIsPostLiked route

@postsRouter.get("/{postId}")
async def getPostResponse(postId: int):
    return await getPost(postId)

@postsRouter.delete("/{postId}")
async def deletePostResponse(postId: int):
    return await deletePost(postId)

