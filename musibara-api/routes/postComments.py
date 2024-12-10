from fastapi import APIRouter, Depends, Request
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from services.postComments import getCommentsByPostId, createNewComment, likeComment, unlikeComment, getIsCommentLiked
from musibaraTypes.comments import MusibaraCommentType, MusibaraCommentLikeType
from services.user_auth import get_id_username_from_cookie

postCommentsRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@postCommentsRouter.get("/{postId}", tags=["Posts"])
async def get_comments_by_post_id(postId: int):
    return await getCommentsByPostId(postId)

@postCommentsRouter.get("/isLiked/{postcommentid}", tags=["Posts"])
async def get_is_comment_liked(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    isLiked = await getIsCommentLiked(user_id, request.path_params.get("postcommentid"))
    return {"isLiked": isLiked}

@postCommentsRouter.post("/new", tags=["Posts"])
async def create_new_comment(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    comment = MusibaraCommentType(postid = data['postid'], parentcommentid = data['parentcommentid'], userid = user_id, content = data['content'])
    return await createNewComment(comment)

@postCommentsRouter.post("/like", tags=["Posts"])
async def like_comment(request: Request):
    # postCommentLike: MusibaraCommentLikeType
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    postCommentLike = MusibaraCommentLikeType(userid = user_id, postcommentid = data['postcommentid'])
    return await likeComment(postCommentLike)

@postCommentsRouter.post("/unlike", tags=["Posts"])
async def unlike_comment(request: Request):
    user_id = get_id_username_from_cookie(request)[0]
    data = await request.json()
    postCommentUnlike = MusibaraCommentLikeType(userid = user_id, postcommentid = data['postcommentid'])
    return await unlikeComment(postCommentUnlike)