from fastapi import APIRouter, Depends, Response, Request
from services.playlists import exportPlaylist
from typing_extensions import Annotated

playlistRouter = APIRouter()

@playlistRouter.post("/export/{playlist_id}")  # user will provide provider (spotify/apple)
async def exportPlaylistResponse(request: Request, playlist_id):
    isrc_list = ["QZAPK1700041", "USMV20500178"]
    await exportPlaylist(request, isrc_list, playlist_id)
