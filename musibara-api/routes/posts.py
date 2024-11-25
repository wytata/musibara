from fastapi import APIRouter, Request
from services.feed import get_users_feed, get_tags_feed
from services.postTags import set_post_tags
from services.posts import createNewPost, getHomePosts, getPostsByUsername, deletePost, getPost, likePost, unlikePost, getIsLiked 
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

@postsRouter.get("/user/{username}")
async def getUserPostsResponse(username: str):
    return await getPostsByUsername(username)

@postsRouter.put("/new")
async def newPostResponse(request: Request):
    username = get_id_username_from_cookie(request)[1]
    print(username)
    data = await request.json()
    post = MusibaraPostType(username = username, title = data['title'], content = data['content'], herdname = data['herdname'], tags = data['tags'])
    print(post)
    return await createNewPost(post)

@postsRouter.get("/isLiked/{postid}")
async def getIsLikedResponse(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    isLiked = await getIsLiked(user_id, request.path_params.get("postid"))
    return {"isLiked": isLiked}

@postsRouter.post("/like")
async def postLikeResponse(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    postLike = MusibaraPostLikeType(userid = user_id, postid = data['postid'])
    return await likePost(postLike)

@postsRouter.post("/unlike")
async def postUnlikeResponse(request: Request):
    # postUnlike: MusibaraPostLikeType
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    postUnlike = MusibaraPostLikeType(userid = user_id, postid = data['postid'])
    return await unlikePost(postUnlike)

@postsRouter.get("/feed/{tag_id}/{offset}")
async def get_tag_feed_response(request:Request,tag_id:str, offset:int):
    return await get_tags_feed(request, tag_id, offset)

@postsRouter.get("/feed/{offset}")
async def get_feed_response(request:Request, offset):
    return await get_users_feed(request,offset)



@postsRouter.get("/{postId}")
async def getPostResponse(request: Request, postId: int):
    return await getPost(request, postId)

@postsRouter.delete("/{postId}")
async def deletePostResponse(postId: int):
    return await deletePost(postId)




