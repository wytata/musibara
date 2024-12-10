from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi import Form, UploadFile, File
from typing_extensions import Annotated
from services.herds import createHerd, get_herd_posts_by_id, getHerdById, get_all_users_herds, get_all_herds, joinHerdById, exitHerdById
from musibaraTypes.herds import Herd
from services.playlists import get_herd_playlists

herdsRouter = APIRouter()

@herdsRouter.get("/id/{herd_id}", tags=["Herds"])
async def get_herd_by_id(request: Request, herd_id: int):
    return await getHerdById(request, herd_id)

@herdsRouter.put("/new", tags=["Herds"])
async def create_new_herd(
        request: Request,
        image: UploadFile = File(None),
        name: str = Form(...),
        description: str = Form(...)
    ):
    return await createHerd(request, image, name, description)

@herdsRouter.post("/join/{herd_id}", tags=["Herds"])
async def join_herd_by_id(request: Request, herd_id: int):
    return await joinHerdById(request, herd_id)

@herdsRouter.post("/leave/{herd_id}", tags=["Herds"])
async def exit_herd_by_id(request: Request, herd_id: int):
    return await exitHerdById(request, herd_id)

@herdsRouter.get("/me", tags=["Herds"])
async def get_all_current_users_herds(request: Request):
    return await get_all_users_herds(request)

@herdsRouter.get("/all", tags=["Herds"])
async def get_all_herds(request: Request):
    return await get_all_herds(request)

@herdsRouter.get("/posts/{herd_id}", tags=["Herds"])
async def get_herd_posts_by_id(request: Request, herd_id: int):
    return await get_herd_posts_by_id(request, herd_id)

@herdsRouter.get("/playlists/{herd_id}", tags=["Herds"])
async def get_herd_playlists(herd_id: int):
    return await get_herd_playlists(herd_id)
