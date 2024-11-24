from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi import Form, UploadFile, File
from typing_extensions import Annotated
from services.search import search_playlists, search_tags, search_herds, search_users

searchRouter = APIRouter()

@searchRouter.post("/playlists")
async def search_playlists_reponse(search_term: Annotated[str, Form()]):
    return await search_playlists(search_term)

@searchRouter.post("/users")
async def search_users_reponse(search_term: Annotated[str, Form()]):
    return await search_users(search_term)

@searchRouter.post("/herds")
async def search_herds_reponse(search_term: Annotated[str, Form()]):
    return await search_herds(search_term)

@searchRouter.post("/tags")
async def search_tags_reponse(search_term: Annotated[str, Form()]):
    return await search_tags(search_term)
