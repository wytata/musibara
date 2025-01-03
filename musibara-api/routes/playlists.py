from typing import Optional
from fastapi import APIRouter, Depends, Response, Request, UploadFile, File, Form, BackgroundTasks
from typing_extensions import Annotated
from services.playlists import delete_playlist_by_id, get_playlist_by_id, create_playlist, add_song_to_playlist, delete_song_from_playlist, get_user_playlists, import_playlist, get_playlists_by_userid, create_import_job
from services.users import get_current_user
from musibaraTypes.playlists import PlaylistImportRequest, MusibaraPlaylistType


playlistsRouter = APIRouter()

@playlistsRouter.get("/{playlist_id}", tags=["Playlists"])
async def get_playlist_by_id(playlist_id: int):
    # comment
    return await get_playlist_by_id(playlist_id)

@playlistsRouter.put("/new", tags=["Playlists"])
async def create_playlist(
            request: Request,
        playlist_name: Annotated[str, Form()],
        playlist_description: Annotated[str, Form()],
        herd_id: Optional[int] = Form(None),
        file: UploadFile = File(None)):
    playlist = MusibaraPlaylistType(name=playlist_name, description=playlist_description, herd_id=herd_id)
    return await create_playlist(request, playlist, file)

@playlistsRouter.delete("/{playlist_id}", tags=["Playlists"])
async def delete_playlist_by_id(request: Request, playlist_id: int):
    return await delete_playlist_by_id(request, playlist_id)

@playlistsRouter.post("/{playlist_id}/song", tags=["Playlists"])
async def add_song_to_playlist(request: Request, playlist_id: int, song_id: Annotated[str, Form()]):
    return await add_song_to_playlist(request, playlist_id, song_id)

@playlistsRouter.delete("/{playlist_id}/song", tags=["Playlists"])
async def delete_song_from_playlist(request: Request, playlist_id: int, song_id: Annotated[str, Form()]):
    return await delete_song_from_playlist(request, playlist_id, song_id)

@playlistsRouter.get("/", tags=["Playlists"])
async def get_user_playlists(request: Request):
    return await get_user_playlists(request)

@playlistsRouter.get("/user/{user_id}", tags=["Playlists"])
async def get_playlists_by_userid(user_id: int):
    return await get_playlists_by_userid(user_id)

@playlistsRouter.post("/import", tags=["Playlists"]) 
async def create_import_job_for_playlists(request: Request, playlist: PlaylistImportRequest, tasks: BackgroundTasks):
    return await create_import_job(request, playlist, tasks)
