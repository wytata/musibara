from fastapi import APIRouter, Depends, Response, Request, Form
from typing_extensions import Annotated
from musibaraTypes.albums import AlbumSearch, Album
from services.albums import save_album, search_album_by_name

albumsRouter = APIRouter()

@albumsRouter.post("/search/")
async def search_album_response(album_search: AlbumSearch):
    return await search_album_by_name(album_search)

@albumsRouter.put("/save")
async def save_album_response(album: Album):
    return await save_album(album)
