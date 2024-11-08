from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Form
from services.users import user_login, user_registration, get_all_users, get_current_user, get_user_by_name 
from typing_extensions import Annotated

userRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@userRouter.get("/")
async def get_all_users_response(request: Request):
    print(request.headers)
    return await get_all_users()

@userRouter.get("/me")
async def get_me_response(request: Request):
    return await get_current_user(request)

@userRouter.post("/token", status_code=fastapi.status.HTTP_200_OK)
async def user_login_response(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    return await user_login(response, form_data)

@userRouter.post("/register", status_code=fastapi.status.HTTP_201_CREATED)
async def user_registration_response(username: Annotated[str, Form()], password: Annotated[str, Form()], email: Annotated[str, Form()], phone: Annotated[str, Form()]):
    return await user_registration(username, password, email, phone)

@userRouter.get("/byname")
async def get_user_by_name_response(request: dict):
    return await get_user_by_name(request["username"])
