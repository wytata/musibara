from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi import Form
from typing_extensions import Annotated
from services.herds import getHerdById

herdsRouter = APIRouter()

@herdsRouter.get("/{herd_id}")
async def getHerdResponse(herd_id: int):
    return await getHerdById(herd_id)
