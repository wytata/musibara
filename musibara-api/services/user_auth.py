from enum import nonmember
from fastapi.responses import JSONResponse
import jwt
from fastapi import Request, HTTPException, Response, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from config.db import get_db_connection, release_db_connection


SECRET_KEY="9c3126ab71aab65b1a254c314f57a3af42dfbe896e21b2c12bee8f60c027cf6"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRATION_MINUTES=30


# NOTE: This also checks if the cookie is expired    
def get_id_username_from_cookie(request: Request):
    cookies = request.cookies
    try:
        access_token = cookies["accessToken"]
        if not access_token:
            return None, None
        id: str | None = ""
        username: str | None = ""
        time: str = ""

        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # NOTE: Not sure if we should throw errors, or return None and let caller handle 
        id = payload['id']
        username = payload['sub']
        
        if len(username)==0:
            username=None

        # Invalidate expired token
        if is_time_expired(request):
            id = None
            username = None

        return id, username

    except jwt.ExpiredSignatureError:
        print("Access Token Expired")
        return None, None
    except jwt.InvalidTokenError:
        print("Invalid Access Token")
        return None, None
    except Exception as e:
        print(f"Error: {e}")
        return None, None

def get_cookie(response: Response, username:str, id= None):
    if id is None:
       result = get_user_id(username)
       id = result

    accessTokenExpiration = timedelta(minutes=ACCESS_TOKEN_EXPIRATION_MINUTES)
    dataToEncode = {"sub": username, "exp": datetime.now(timezone.utc)+accessTokenExpiration, "id": id}
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


def refresh_cookie(request: Request):
    user_id, username = get_id_username_from_cookie(request)
    if (not user_id or not username) and is_time_expired(request):
        raise HTTPException(status_code=403, detail="Invalid refresh token")
    
    response = JSONResponse(content=None)
    get_cookie(response, username, user_id)
    return response


def is_time_expired(request: Request):
    cookies = request.cookies
    try:
        access_token = cookies["accessToken"]
        if not access_token:
            return False
        time_str: str = ""

        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # NOTE: Not sure if we should throw errors, or return None and let caller handle
        time_str:str = payload["exp"]
        time = datetime.fromisoformat(time_str)
        if time.tzinfo is None:
            time = time.replace(tzinfo=timezone.utc)
        current_time = datetime.now(timezone.utc)
        if current_time>time:
            print("Token is expired")
            return False

        return True

    except jwt.ExpiredSignatureError:
        print("Access Token Expired")
        return False
    except jwt.InvalidTokenError:
        print("Invalid Access Token")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False


# NOTE: Had to duplicate this from users due to circular import
def get_user_id(username:str):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        print(username)
        cursor.execute(f'SELECT userid FROM users WHERE username = %s;', (username,))
        rows = cursor.fetchone()
        return rows[0]
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with getting user id in user auth",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            release_db_connection(db)


