from typing import Optional
from fastapi import APIRouter, Depends, Response, Request, UploadFile, File, Form
from typing_extensions import Annotated
from services.playlists import get_playlist_by_id, create_playlist
from musibaraTypes.playlists import MusibaraPlaylistType

playlistsRouter = APIRouter()

@playlistsRouter.get("/{playlist_id}")
async def get_playlist_response(playlist_id: int):
    return await get_playlist_by_id(playlist_id)

@playlistsRouter.put("/new")
async def create_playlist_response(
        request: Request,
        playlist_name: Annotated[str, Form()],
        playlist_description: Annotated[str, Form()],
        user_id: Annotated[int, Form()],
        herd_id: Optional[int] = Form(None),
        file: UploadFile = File(None)):
    playlist = MusibaraPlaylistType(name=playlist_name, description=playlist_description, user_id=user_id, herd_id=herd_id)
    return await create_playlist(request, playlist, file)

@playlistsRouter.delete("/{playlist_id}")
async def delete_playlist_response(request: Request, playlist_id: int):
    return await delete_playlist_by_id(request, playlist_id)
