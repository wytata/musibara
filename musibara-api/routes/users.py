from fastapi import APIRouter, Depends, Response, Request
import fastapi
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Form
from services.users import refresh_access_token, user_login, user_registration, get_all_users, get_current_user, get_user_by_name, set_music_streaming_access_token , get_music_streaming_access_token
from musibaraTypes.users import TokenRequest
from typing_extensions import Annotated

userRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@userRouter.get("/")
async def get_all_users_response(request: Request):
    print(request.headers)
    return await get_all_users()

@userRouter.get("/me")
async def get_me_response(request: Request):
    user = await get_current_user(request)
    print(user)
    refreshed_access_token = await refresh_access_token(request, user["username"], user["userid"])
    response = JSONResponse(content=user)
    print(refreshed_access_token)
    if refreshed_access_token is not None:
        print("hello world!")
        response.set_cookie(
            key="accessToken",
            value=refreshed_access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=1800,
            path ="/" 
        )
    return response
    #return await get_current_user(request)

@userRouter.post("/token", status_code=fastapi.status.HTTP_200_OK)
async def user_login_response(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    return await user_login(response, form_data)

@userRouter.post("/register", status_code=fastapi.status.HTTP_201_CREATED)
async def user_registration_response(username: Annotated[str, Form()], password: Annotated[str, Form()], email: Annotated[str, Form()], phone: Annotated[str, Form()]):
    return await user_registration(username, password, email, phone)

@userRouter.get("/byname")
async def get_user_by_name_response(request: dict):
    return await get_user_by_name(request["username"])

@userRouter.post("/accessToken/{provider}")
async def setAccessTokenResponse(request: Request, token_request: TokenRequest, provider: str):
    return await set_music_streaming_access_token(request, token_request, provider)

@userRouter.get("/accessToken/{provider}")
async def getAccessTokenResponse(request: Request, provider: str):
    return await get_music_streaming_access_token(request, provider)
