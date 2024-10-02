from fastapi import APIRouter
from services.users import getAllUsers

userRouter = APIRouter()

@userRouter.get("/users")
async def response():
    return await getAllUsers()
