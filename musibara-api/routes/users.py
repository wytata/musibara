from fastapi import APIRouter
import json

userRouter = APIRouter()

@userRouter.get("/users")
async def getAllUsers():
    data = None
    with open("routes/sampleData/users.json") as usersJson:
        data = json.load(usersJson)
    return data
