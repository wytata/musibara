from fastapi import APIRouter, Depends, Response, Request, UploadFile, File
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Form
from services.users import follow_user_by_id, unfollow_user_by_id, user_login, user_logout, user_registration, get_all_users, get_current_user, get_user_by_name, set_music_streaming_access_token , get_music_streaming_access_token, update_user, update_profile_picture, update_banner_picture
from musibaraTypes.users import TokenRequest, User
from typing_extensions import Annotated

userRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@userRouter.get("/", tags=["Users"])
async def get_list_of_all_users(request: Request):
    print(request.headers)
    return await get_all_users()

@userRouter.get("/me", tags=["Users"])
async def get_current_user_information_if_logged_in(request: Request):
    return await get_current_user(request)

@userRouter.post("/settings", tags=["Users"])
async def update_or_change_user_information_from_settings(
    request: Request,
    name: Annotated[str, Form()] = None,
    username: Annotated[str, Form()] = None,
    bio: Annotated[str, Form()] = None,
    email: Annotated[str, Form()] = None,
    phone: Annotated[str, Form()] = None,
    password: Annotated[str, Form()] = None,
    profile_photo: UploadFile = File(None),
    banner_photo: UploadFile = File(None)
):
    user = User(name=name, username=username, bio=bio, email=email, phone=phone, profile_photo=profile_photo, banner_photo=banner_photo, password=password)
    return await update_user(request, user)

@userRouter.post("/profilepicture", tags=["Users"])
async def set_profile_picture_for_user(request: Request, file: UploadFile = File(None)):
    return await update_profile_picture(request, file)

@userRouter.post("/bannerpicture", tags=["Users"])
async def set_banner_picture__for_user(request: Request, file: UploadFile = File(None)):
    return await update_banner_picture(request, file)

@userRouter.post("/token", tags=["Users"], status_code=fastapi.status.HTTP_200_OK)
async def login_current_user(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    return await user_login(response, form_data)

@userRouter.get("/logout", tags=["Users"])
async def logout_current_user(request: Request):
    return await user_logout(request)

@userRouter.post("/register", tags=["Users"], status_code=fastapi.status.HTTP_201_CREATED)
async def register_current_user(username: Annotated[str, Form()], name: Annotated[str, Form()], password: Annotated[str, Form()], email: Annotated[str, Form()], phone: Annotated[str, Form()]):
    return await user_registration(username, name, password, email, phone)

@userRouter.get("/byname/{username}", tags=["Users"])
async def get_user_by_name(request:Request, username: str):
    return await get_user_by_name(request,username)

@userRouter.post("/accessToken/{provider}", tags=["Users"])
async def set_access_token_for_music_streaming_service(request: Request, token_request: TokenRequest, provider: str):
    return await set_music_streaming_access_token(request, token_request, provider)

@userRouter.get("/accessToken/{provider}", tags=["Users"])
async def get_access_token_for_music_streaming_service(request: Request, provider: str):
    return await get_music_streaming_access_token(request, provider)

@userRouter.post("/follow/{user_id}", tags=["Users"])
async def follow_user(request: Request, user_id: int):
    return await follow_user_by_id(request, user_id)

@userRouter.post("/unfollow/{user_id}", tags=["Users"])
async def unfollow_user(request: Request, user_id: int):
    return await unfollow_user_by_id(request, user_id)

