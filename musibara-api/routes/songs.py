from fastapi import APIRouter, Depends, Response, Request
from typing_extensions import Annotated
from services.songs import saveSong, searchSongByName
from musibaraTypes.songs import SongRequest, SaveSongRequest

songsRouter = APIRouter()

@songsRouter.post("/search")
async def searchByNameResponse(request: SongRequest):
    return await searchSongByName(request)

@songsRouter.put("/save")
async def saveSongResponse(request: SaveSongRequest):
    return await saveSong(request)
