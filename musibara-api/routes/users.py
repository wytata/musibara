from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Form
from services.users import getAllUsers, getCurrentUser, getUserByName, userLogin, userRegistration, followUserById
from typing_extensions import Annotated

userRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@userRouter.get("/")
async def getAllUsersResponse(request: Request):
    print(request.headers)
    return await getAllUsers()

@userRouter.get("/me")
async def getMeResponse(request: Request):
    return await getCurrentUser(request)

@userRouter.post("/token", status_code=fastapi.status.HTTP_200_OK)
async def userLoginResponse(response: Response, formData: OAuth2PasswordRequestForm = Depends()):
    return await userLogin(response, formData)

@userRouter.post("/register", status_code=fastapi.status.HTTP_201_CREATED)
async def userRegistrationResponse(username: Annotated[str, Form()], password: Annotated[str, Form()], email: Annotated[str, Form()], phone: Annotated[str, Form()]):
    return await userRegistration(username, password, email, phone)

@userRouter.get("/byname")
async def getMeResponse(request: dict):
    return await getUserByName(request)

@userRouter.post("/follow/{user_id}")
async def userFollowResponse(request: Request, user_id: int):
    return await followUserById(request, user_id)
    



