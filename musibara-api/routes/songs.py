from fastapi import APIRouter, Depends, Response, Request
from typing_extensions import Annotated
from services.songs import searchSongByName
import musicbrainzngs

songsRouter = APIRouter()

@songsRouter.get("/search/{song_name}")
async def searchByNameResponse(song_name: str):
    return await searchSongByName(song_name)
