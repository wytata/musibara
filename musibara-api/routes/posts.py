from fastapi import APIRouter, Request
from services.feed import get_users_feed, get_tags_feed
from services.postTags import set_post_tags, get_tag_info
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

@postsRouter.get("/home", tags=["Posts"], response_model=List[MusibaraPostType])
async def get_home_posts() -> List[MusibaraPostType]:
    """
    NOTE: This is currently not used!
    
    Retrieve home posts.
    
    Returns:
        List[MusibaraPostType]: A list of posts.
    """
    return await getHomePosts()

@postsRouter.get("/me", tags=["Posts"])
async def get_posts_made_by_current_user(request: Request):
    username = get_id_username_from_cookie(request)[1]
    print(username)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})
    
    return await getPostsByUsername(username)

@postsRouter.get("/user/{username}", tags=["Posts"])
async def get_posts_made_by_user_via_username(username: str):
    return await getPostsByUsername(username)

@postsRouter.put("/new", tags=["Posts"])
async def create_new_post(request: Request):
    username = get_id_username_from_cookie(request)[1]
    print(username)
    data = await request.json()
    post = MusibaraPostType(username = username, title = data['title'], content = data['content'], herdname = data['herdname'], tags = data['tags'])
    print(post)
    return await createNewPost(post)

@postsRouter.get("/isLiked/{postid}", tags=["Posts"])
async def check_if_post_is_liked_via_postid(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    isLiked = await getIsLiked(user_id, request.path_params.get("postid"))
    return {"isLiked": isLiked}

@postsRouter.post("/like", tags=["Posts"])
async def like_post_for_current_user(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    postLike = MusibaraPostLikeType(userid = user_id, postid = data['postid'])
    return await likePost(postLike)

@postsRouter.post("/unlike", tags=["Posts"])
async def unlike_post_for_current_user(request: Request):
    # postUnlike: MusibaraPostLikeType
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    postUnlike = MusibaraPostLikeType(userid = user_id, postid = data['postid'])
    return await unlikePost(postUnlike)

@postsRouter.get("/feed/{mbid}/{offset}", tags=["Content"])
async def get_tag_feed(request:Request, mbid:str, offset:int):
    return await get_tags_feed(request, mbid, offset)

@postsRouter.get("/feed/{offset}", tags=["Content"])
async def get_feed(request:Request, offset):
    return await get_users_feed(request,offset)

@postsRouter.get("/tag/info/{mbid}", tags=["Content"])
async def get_tag_info(mbid:str):
    return await get_tag_info(mbid)

@postsRouter.get("/{postId}", tags=["Posts"])
async def get_posts_via_postid(request: Request, postId: int):
    return await getPost(request, postId)

@postsRouter.delete("/{postId}", tags=["Posts"])
async def delete_post(postId: int):
    return await deletePost(postId)




