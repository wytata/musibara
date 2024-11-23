from datetime import datetime, timezone, timedelta
from fastapi.responses import JSONResponse
import jwt
import json
from starlette.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
from typing_extensions import Annotated, deprecated
from config.db import get_db_connection
from musibaraTypes.users import TokenRequest, User

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, Response, Request, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

from .user_auth import get_cookie, get_id_username_from_cookie

from config.aws import get_bucket_name
from services.s3bucket_images import upload_image_s3

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def update_user(request: Request, user: User):
    id , username = get_id_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to set an accessToken for an external platform."})
    db = get_db_connection()
    cursor = db.cursor()

    update_query = "UPDATE users SET "
    set_values = []

    profilephoto_id = None
    bannerphoto_id = None
    print(user)

    try:
        if user.profile_photo:
            file_name = str(user.profile_photo.filename)
            bucket_name = get_bucket_name()
            profilephoto_id = await upload_image_s3(user.profile_photo, bucket_name, file_name)
            set_values.append(f"profilephoto = {profilephoto_id}")
        if user.banner_photo:
            file_name = str(user.banner_photo.filename)
            bucket_name = get_bucket_name()
            bannerphoto_id = await upload_image_s3(user.banner_photo, bucket_name, file_name)
            set_values.append(f"bannerphoto = {bannerphoto_id}")
        if user.username:
            set_values.append(f"username = '{user.username}'")
        if user.name:
            set_values.append(f"name = '{user.name}'")
        if user.email:
            set_values.append(f"email = '{user.email}'")
        if user.phone:
            set_values.append(f"phone = '{user.phone}'")
        if user.bio:
            set_values.append(f"bio = '{user.bio}'")

        if not set_values:
            return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Server failed to update user details."})

        update_query += ", ".join(set_values) + f" WHERE userid = {id}"
        cursor.execute(update_query)
        db.commit()
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Server failed to update user details."})
    return JSONResponse(status_code=HTTP_200_OK, content={"msg": f"Successfully updated user {username}"})

async def update_profile_picture(request: Request, file: UploadFile):
    id , username = get_id_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to set an accessToken for an external platform."})

    image_id = None
    if file is not None:
        file_name = str(file.filename)
        bucket_name = get_bucket_name()
        image_id = await upload_image_s3(file, bucket_name, file_name)
    if image_id is None:
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"msg": "Server failed to upload profile photo."})

    try:
        db = get_db_connection()
        cursor = db.cursor()
        update_user_query = f"UPDATE users SET profilephoto = %s WHERE userid = {id}"
        cursor.execute(update_user_query, (image_id, ))
        db.commit()
        return JSONResponse(status_code=HTTP_200_OK, content={"msg": f"Successfully uploaded profile photo for user {username}"})
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"msg": "Server failed to upload profile photo."})

async def update_banner_picture(request: Request, file: UploadFile):
    id , username = get_id_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to set an accessToken for an external platform."})

    image_id = None
    if file is not None:
        file_name = str(file.filename)
        bucket_name = get_bucket_name()
        image_id = await upload_image_s3(file, bucket_name, file_name)
    if image_id is None:
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"msg": "Server failed to upload banner photo."})

    try:
        db = get_db_connection()
        cursor = db.cursor()
        update_user_query = f"UPDATE users SET bannerphoto = %s WHERE userid = {id}"
        cursor.execute(update_user_query, (image_id, ))
        db.commit()
        return JSONResponse(status_code=HTTP_200_OK, content={"msg": f"Successfully uploaded banner photo for user {username}"})
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"msg": "Server failed to upload banner photo."})


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

        cursor.execute(f'INSERT INTO users(userid, username, password, email, phone) VALUES (default, \'{username}\', \'{hashed_password}\', \'{email}\', \'{phone}\');')
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
    cursor.execute(f'SELECT * FROM USERS WHERE username =%s;', (username,))
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
    
async def follow_user_by_id(request: Request, user_id: int):
    id , username = get_id_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to perform this action."})
    try:
        db = get_db_connection()
        cursor = db.cursor()
        insert_statement = "INSERT INTO follows (userid, followingid, createdts) VALUES (%s, %s, default)"
        cursor.execute(insert_statement, (id, user_id, ))
        db.commit()
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Server could not satisfy follow request."})
    return JSONResponse(status_code=HTTP_200_OK, content={"msg": f"Successfully followed user {user_id}"})

async def unfollow_user_by_id(request: Request, user_id: int):
    id , username = get_id_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be logged in to perform this action."})
    try:
        db = get_db_connection()
        cursor = db.cursor()
        delete_statement = "DELETE FROM follows WHERE userid = %s AND followingid = %s"
        cursor.execute(delete_statement, (id, user_id, ))
        db.commit()
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Server could not satisfy unfollow request."})
    return JSONResponse(status_code=HTTP_200_OK, content={"msg": f"Successfully unfollowed user {user_id}"})
