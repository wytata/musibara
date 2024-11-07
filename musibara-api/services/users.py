from datetime import datetime, timezone, timedelta
from fastapi.responses import JSONResponse
import jwt
import json
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from typing_extensions import Annotated, deprecated
from config.db import get_db_connection
from musibaraTypes.users import TokenRequest

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

from services.user_auth import get_auth_username

SECRET_KEY="9c3126ab71aab65b1a254c314f57a3af42dfbe896e21b2c12bee8f60c027cf6"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRATION_MINUTES=30

passwordContext = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

async def getAllUsers():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows]

    return result

def authenticateUser(username: str, password: str):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'SELECT username, password FROM users WHERE username = \'{username}\'')
    rows = cursor.fetchall()
    if not rows:
        return None

    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows][0]

    print(result)
    dbUser = result["username"]
    dbPass = result["password"]

    if not dbUser:
        return False
    if not passwordContext.verify(password, dbPass):
        return False
    return dbUser


async def userLogin(response: Response, formData: OAuth2PasswordRequestForm = Depends()):
    username, password = formData.username, formData.password
    user = authenticateUser(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    accessTokenExpiration = timedelta(minutes=ACCESS_TOKEN_EXPIRATION_MINUTES)
    dataToEncode = {"sub": user, "exp": datetime.now(timezone.utc)+accessTokenExpiration}
    print(dataToEncode)
    accessToken = jwt.encode(dataToEncode, SECRET_KEY, algorithm=ALGORITHM)
    response.set_cookie(
        key="accessToken",
        value=accessToken,
        httponly=True,
        secure=True,
        samesite=None,
        max_age=ACCESS_TOKEN_EXPIRATION_MINUTES*60,
    )
    return {"msg": "success"}

async def userRegistration(username: Annotated[str, Form()], password: Annotated[str, Form()], email: Annotated[str, Form()], phone: Annotated[str, Form()]):
    #username, password, email, phone = formData.username, formData.password, formData.email, formData.phone
    db = get_db_connection()
    hashedPassword = passwordContext.hash(password)
    cursor = db.cursor()
    cursor.execute(f'INSERT INTO USERS(userid, username, password) VALUES (default, \'{username}\', \'{hashedPassword}\')')
    db.commit()
    return {"msg": "hello world"}

async def getCurrentUser(request: Request):
    cookies = request.cookies
    if "accessToken" not in cookies.keys():
        return None

    accessToken = cookies["accessToken"]
    username: str = ""
    try:
        payload = jwt.decode(accessToken, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            return None
    except jwt.InvalidTokenError:
        return None
    user = await getUserByName({"username": username})
    if user is None:
        return None
    return user

async def getUserByName(request: dict):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'SELECT userid, name FROM USERS WHERE name = \'{request["username"]}\'')
    rows = cursor.fetchone()
    print(rows)
    columnNames = [desc[0] for desc in cursor.description]
    print(columnNames)
    result = dict(zip(columnNames, rows))
    return result

async def setAccessToken(request: Request, token_request: TokenRequest, provider: str):
    username = get_auth_username(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to set an accessToken for an external platform."})

    db = get_db_connection()
    cursor = db.cursor()
    if provider == "spotify":
        update_statement = f"UPDATE users SET spotifyaccesstoken='{token_request.access_token}'"
        if token_request.refresh_token is not None:
            update_statement += f", spotifyrefreshtoken='{token_request.refresh_token}'" 

        update_statement += f" WHERE username = '{username}'"
        print(update_statement)
        cursor.execute(update_statement)
        db.commit()
    elif provider == "apple music":
        pass
    else:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Invalid provider. Provider must be spotify or apple music."})

    return None













