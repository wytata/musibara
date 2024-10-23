from fastapi import APIRouter, Depends, Response, Request
from typing_extensions import Annotated
from services.songs import searchSongByName
import musicbrainzngs
from musibaraTypes.songs import SongRequest

songsRouter = APIRouter()

@songsRouter.post("/search/")
async def searchByNameResponse(request: SongRequest):
    return await searchSongByName(request)
