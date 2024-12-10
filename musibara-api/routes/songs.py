from fastapi import APIRouter, Depends, Response, Request
from typing_extensions import Annotated
from services.songs import saveSong, searchSongByName
from musibaraTypes.songs import SongRequest, SaveSongRequest

songsRouter = APIRouter()

@songsRouter.post("/search", tags=["Songs"])
async def search_song_by_name(request: SongRequest):
    return await searchSongByName(request)

@songsRouter.put("/save", tags=["Songs"])
async def save_song(request: SaveSongRequest):
    return await saveSong(request)
