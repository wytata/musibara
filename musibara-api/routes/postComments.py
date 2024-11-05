from fastapi import APIRouter, Depends 
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from services.postComments import getCommentsByPostId

postCommentsRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@postCommentsRouter.get("/{postId}")
async def postCommentsByIdResponse(postId: int):
    return await getCommentsByPostId(postId)
