from fastapi import APIRouter, Depends 
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from services.postComments import getCommentsByPostId, createNewComment, likeComment, unlikeComment
from musibaraTypes.comments import MusibaraCommentType, MusibaraCommentLikeType

postCommentsRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@postCommentsRouter.get("/{postId}")
async def postCommentsByIdResponse(postId: int):
    return await getCommentsByPostId(postId)

@postCommentsRouter.post("/new")
async def createNewCommentResponse(comment: MusibaraCommentType):
    return await createNewComment(comment)

@postCommentsRouter.post("/like")
async def postCommentLikeResponse(postCommentLike: MusibaraCommentLikeType):
    return await likeComment(postCommentLike)

@postCommentsRouter.post("/unlike")
async def postCommentUnlikeResponse(postCommentUnlike: MusibaraCommentLikeType):
    return await unlikeComment(postCommentUnlike)