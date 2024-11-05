from datetime import datetime, timezone, timedelta
import jwt
import json
from starlette.status import HTTP_401_UNAUTHORIZED
from typing_extensions import Annotated, deprecated
from config.db import get_db_connection

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

from services.user_auth import get_auth_user

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
    cursor.execute(f'SELECT userid, username, password FROM users WHERE name = \'{username}\'')
    rows = cursor.fetchall()
    if not rows:
        return None

    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows][0]

    dbUsername = result["username"]
    dbPassword = result["password"]

    if not dbUsername:
        return False
    if not passwordContext.verify(password, dbPassword):
        return False
    return {"username": dbUsername, "userid": result["userid"]}


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
    hashedPassword = passwordContext.hash(password)
    cursor = db.cursor()
    cursor.execute(f'INSERT INTO USERS(userid, name, password, email, phone) VALUES (default, \'{username}\', \'{hashedPassword}\', \'{email}\', \'{phone}\')')
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

async def followUserById(request: Request, user_id: int):
    user = get_auth_user(request)
    if user is None:
        return Response(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "Unauthenticated user cannot perform this action."})
    
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'INSERT INTO follows(userid, following) VALUES ({user["userid"]}, {user_id})')

      



