from fastapi import APIRouter, Request
from typing import TypedDict, List, Tuple
from services.notifications import get_users_notifications

notifications_router = APIRouter()


@notifications_router.get("/{offset}", tags=["Content"])
async def notifications_response(request: Request, offset:int):
    return await get_users_notifications(request, offset)

