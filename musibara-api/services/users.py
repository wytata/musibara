from sys import exception
from typing_extensions import Annotated, deprecated
from config.db import get_db_connection
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Form, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from .user_auth import get_cookie, get_username_from_cookie

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
    cursor.execute(f'SELECT name, password FROM users WHERE name = \'{username}\'')
    rows = cursor.fetchall()
    if not rows:
        return None

    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows][0]

    db_user = result["name"]
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

        cursor.execute(f'INSERT INTO users(userid, username, password, email, phone) VALUES (default, \'{username}\', \'{hashedPassword}\', \'{email}\', \'{phone}\');')
        db.commit()
        
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
    
    return {"message": "success"}



async def get_current_user(request: Request):
    username = get_username_from_cookie(request)
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
    cursor.execute(f'SELECT userid, name FROM USERS WHERE name =%s;', (username,))
    rows = cursor.fetchone()
    column_names = [desc[0] for desc in cursor.description]
    result = dict(zip(column_names, rows))
    return result




