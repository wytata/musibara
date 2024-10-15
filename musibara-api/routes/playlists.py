from fastapi import APIRouter, Depends 
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

playlistRouter = APIRouter()
oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@playlistRouter.put("/new")
async def createPlaylistResponse():
    return await createPlaylist()
