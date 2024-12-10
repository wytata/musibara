from fastapi import APIRouter, Depends, Response, Request, Form
from typing_extensions import Annotated
from musibaraTypes.artists import Artist, ArtistSearch

from services.artists import save_artist, search_artist_by_name

artistsRouter = APIRouter()

@artistsRouter.post("/search", tags=["Artists"])
async def search_artist(artist_search: ArtistSearch):
    return await search_artist_by_name(artist_search)

@artistsRouter.put("/save", tags=["Artists"])
async def save_artist(artist: Artist):
    return await save_artist(artist)
