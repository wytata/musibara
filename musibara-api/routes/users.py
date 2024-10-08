from fastapi import APIRouter, Depends 
import fastapi
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from services.users import getAllUsers, getCurrentUser, getUserByName, userLogin, userRegistration

userRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@userRouter.get("/")
async def getAllUsersResponse():
    return await getAllUsers()

@userRouter.get("/me")
async def getMeResponse(token: str = Depends(oauth2Scheme)):
    return await getCurrentUser(token)

@userRouter.post("/token")
async def userLoginResponse(formData: OAuth2PasswordRequestForm = Depends()):
    return await userLogin(formData)

@userRouter.post("/register", status_code=fastapi.status.HTTP_201_CREATED)
async def userRegistrationResponse(formData: OAuth2PasswordRequestForm = Depends()):
    return await userRegistration(formData)

@userRouter.get("/byname")
async def getMeResponse(request: dict):
    return await getUserByName(request)
