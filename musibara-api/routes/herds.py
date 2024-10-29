from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi import Form, UploadFile, File
from typing_extensions import Annotated
from services.herds import createHerd, getHerdById
from musibaraTypes.herds import Herd

herdsRouter = APIRouter()

@herdsRouter.get("/{herd_id}")
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
async def joinHerdResponse(user_id: int, herd_id: int):
    return await joinHerdById(user_id, herd_id)
