from fastapi import APIRouter, Depends, Response, Request
from typing_extensions import Annotated
from services.playlists import get_playlist_by_id

playlistsRouter = APIRouter()

@playlistsRouter.get("/{playlist_id}")
async def get_playlist_response(playlist_id: int):
    return await get_playlist_by_id(playlist_id)

