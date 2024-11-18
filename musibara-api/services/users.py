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
from .user_auth import get_cookie, get_id_username_from_cookie

import os
import dotenv

dotenv.load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRATION_MINUTES=30

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_all_users():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows]

    return result

def username_password_match(username: str, password: str):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'SELECT username, password FROM users WHERE username = \'{username}\'')
    rows = cursor.fetchall()
    if not rows:
        return None

    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows][0]

    db_user = result["username"]
    db_pass = result["password"]

    if not db_user:
        return False
    if not password_context.verify(password, db_pass):
        return False
    return db_user


async def user_login(response: Response, formData: OAuth2PasswordRequestForm = Depends()):
    username, password = formData.username, formData.password
    user = username_password_match(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    get_cookie(response, user)
    return {"message": "success"}

async def user_registration(username: Annotated[str, Form()], password: Annotated[str, Form()], email: Annotated[str, Form()], phone: Annotated[str, Form()]):
    #username, password, email, phone = formData.username, formData.password, formData.email, formData.phone
    id: int = -1
    try:
        hashed_password = password_context.hash(password)
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f"SELECT 1 FROM users WHERE username=%s;", (username,) )
        present_user = cursor.fetchone()
        if present_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is already registered",
                headers={"WWW-Authenticate": "Bearer"},
            )

        cursor.execute(f'INSERT INTO users(userid, username, password, email, phone) VALUES (default, \'{username}\', \'{hashed_password}\', \'{email}\', \'{phone}\') RETURNING userid;')
        db.commit()
        id = cursor.fetchone()[0]
        
    except HTTPException as http_error:
        print(f"Handling HTTPException: {http_error.detail}")
        raise http_error  

    except Exception as e:
        print(f"User registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Registration error",
            headers={"WWW-Authenticate": "Bearer"},
        )

    refreshTokenExpiratoin = timedelta(days=3650) # essentially infinite for our purposes
    refreshEncodeData = {"sub": username+"refresh", "exp": datetime.now(timezone.utc)+refreshTokenExpiratoin, "id": id}
    refreshToken = jwt.encode(refreshEncodeData, SECRET_KEY, algorithm=ALGORITHM)

    cursor.execute("UPDATE users SET refreshtoken = %s WHERE userid = %s", (refreshToken, id))
    db.commit()
    
    return {"message": "success"}



async def get_current_user(request: Request):
    _ , username = get_id_username_from_cookie(request)
    if username is None:
        print(f'No accessToken present for user in cookies: {request.cookies}')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No Auth Token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await get_user_by_name(username)
    if user is None:
        print(f"No user found with username: '{username}' in get_current_user()") 
        return None

    return user

async def get_user_by_name(username:str):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'SELECT userid, username, name, spotifyaccesstoken, spotifyrefreshtoken, applemusictoken FROM USERS WHERE username =%s;', (username,))
    rows = cursor.fetchone()
    column_names = [desc[0] for desc in cursor.description]
    result = dict(zip(column_names, rows))
    return result

async def set_music_streaming_access_token(request: Request, token_request: TokenRequest, provider: str):
    _ , username = get_id_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to set an accessToken for an external platform."})

    print(provider)
    db = get_db_connection() 
    cursor = db.cursor()
    if provider == "spotify":
        update_statement = f"UPDATE users SET spotifyaccesstoken='{token_request.access_token}'"
        if token_request.refresh_token is not None:
            update_statement += f", spotifyrefreshtoken='{token_request.refresh_token}'" 

        update_statement += f" WHERE username = '{username}'"
        cursor.execute(update_statement)
        db.commit()
    elif provider == "applemusic":
        update_statement = "UPDATE users SET applemusictoken = %s WHERE username = %s"
        cursor.execute(update_statement, (token_request.access_token ,username))
        db.commit()
        pass
    else:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Invalid provider. Provider must be spotify or apple music."})

    return None

async def get_music_streaming_access_token(request: Request, provider: str):
    _ , username = get_id_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to retrieve an accessToken for an external platform."})
    
    db = get_db_connection()
    cursor = db.cursor()
    if provider == "spotify":
        cursor.execute(f'SELECT spotifyaccesstoken FROM users WHERE username = \'{username}\'')
        rows = cursor.fetchone()
        columnNames = [desc[0] for desc in cursor.description]
        result = dict(zip(columnNames, rows))
        return result
    elif provider == "apple music":
        pass
    else:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Invalid provider. Provider must be spotify or apple music."})
    
