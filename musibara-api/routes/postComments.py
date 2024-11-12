from fastapi import APIRouter, Depends 
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from services.postComments import getCommentsByPostId, createNewComment
from musibaraTypes.comments import MusibaraCommentType

postCommentsRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@postCommentsRouter.get("/{postId}")
async def postCommentsByIdResponse(postId: int):
    return await getCommentsByPostId(postId)

@postCommentsRouter.post("/new")
async def createNewCommentResponse(comment: MusibaraCommentType):
    return await createNewComment(comment)