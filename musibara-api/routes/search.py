from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi import Form, UploadFile, File
from typing_extensions import Annotated
from services.search import search_playlists, search_tags, search_herds, search_users

searchRouter = APIRouter()

@searchRouter.get("/playlists")
async def search_playlists_reponse(request: Request):
    return await search_playlists(request)

@searchRouter.get("/users")
async def search_users_reponse(request: Request):
    return await search_users(request)

@searchRouter.get("/herds")
async def search_herds_reponse(request: Request):
    return await search_herds(request)

@searchRouter.get("/tags")
async def search_tags_reponse(request: Request):
    return await search_tags(request)
