from enum import nonmember
import jwt
from fastapi import Request, HTTPException, Response, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta

SECRET_KEY="9c3126ab71aab65b1a254c314f57a3af42dfbe896e21b2c12bee8f60c027cf6"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRATION_MINUTES=30


def get_username_from_cookie(request: Request) -> str | None:
    cookies = request.cookies
    access_token = cookies.get("accessToken")
    if not access_token:
       return None
    username: str = ""
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            print('No username in tokenfor get_current_user()')
            return None
    except jwt.InvalidTokenError:
        print('InvalidTokenError in get_current_user()')
        return None

    return username



def get_cookie(response: Response, username:str):

    accessTokenExpiration = timedelta(minutes=ACCESS_TOKEN_EXPIRATION_MINUTES)
    dataToEncode = {"sub": username, "exp": datetime.now(timezone.utc)+accessTokenExpiration}
    accessToken = jwt.encode(dataToEncode, SECRET_KEY, algorithm=ALGORITHM)
    response.set_cookie(
        key="accessToken",
        value=accessToken,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=ACCESS_TOKEN_EXPIRATION_MINUTES*60,
        path ="/"
    )



