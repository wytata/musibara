from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi import Form, UploadFile, File
from typing_extensions import Annotated
from services.herds import createHerd, get_herd_posts_by_id, getHerdById, get_all_users_herds, get_all_herds, joinHerdById, exitHerdById
from musibaraTypes.herds import Herd
from services.playlists import get_herd_playlists

herdsRouter = APIRouter()

@herdsRouter.get("/id/{herd_id}")
async def getHerdResponse(herd_id: int):
    return await getHerdById(herd_id)

@herdsRouter.put("/new")
async def newHerdResponse(
        image: UploadFile = File(None),
        name: str = Form(...),
        description: str = Form(...)
    ):
    return await createHerd(image, name, description)

@herdsRouter.post("/join/{herd_id}")
async def joinHerdResponse(request: Request, herd_id: int):
    return await joinHerdById(request, herd_id)

@herdsRouter.post("/leave/{herd_id}")
async def exitHerdResponse(request: Request, herd_id: int):
    return await exitHerdById(request, herd_id)

@herdsRouter.get("/me")
async def get_all_users_herds_response(request: Request):
    return await get_all_users_herds(request)

@herdsRouter.get("/all")
async def get_all_users_herds_response(request: Request):
    return await get_all_herds(request)

@herdsRouter.get("/posts/{herd_id}")
async def get_herd_posts_response(herd_id: int):
    return await get_herd_posts_by_id(herd_id)

@herdsRouter.get("/playlists/{herd_id}")
async def get_herd_playlists_response(herd_id: int):
    return await get_herd_playlists(herd_id)
