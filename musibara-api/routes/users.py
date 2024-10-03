from fastapi import APIRouter, Depends 
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from services.users import getAllUsers, userLogin

userRouter = APIRouter()

oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

@userRouter.get("/")
async def getAllUsersResponse():
    return await getAllUsers()

@userRouter.post("/token")
async def userLoginResponse(formData: OAuth2PasswordRequestForm = Depends()):
    return await userLogin(formData)
