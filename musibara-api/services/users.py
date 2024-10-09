from datetime import datetime, timezone, timedelta
import jwt
import json
from typing_extensions import deprecated
from config.db import db

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

SECRET_KEY="9c3126ab71aab65b1a254c314f57a3af42dfbe896e21b2c12bee8f60c027cf6"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRATION_MINUTES=30

passwordContext = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")

async def getAllUsers():
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows]

    return result

def authenticateUser(username: str, password: str):
    cursor = db.cursor()
    cursor.execute(f'SELECT name, password FROM users WHERE name = \'{username}\'')
    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows][0]

    dbUser = result["name"]
    dbPass = result["password"]

    if not dbUser:
        return False
    if not passwordContext.verify(password, dbPass):
        return False
    return dbUser


async def userLogin(formData: OAuth2PasswordRequestForm = Depends()):
    username, password = formData.username, formData.password
    user = authenticateUser(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(user)
    return None
    #accessTokenExpiration = timedelta(minutes=ACCESS_TOKEN_EXPIRATION_MINUTES)
    #dataToEncode = {"sub": user, "exp": datetime.now(timezone.utc)+accessTokenExpiration}
    #print(dataToEncode)
    #accessToken = jwt.encode(dataToEncode, SECRET_KEY, algorithm=ALGORITHM)
    #print(accessToken)

async def userRegistration(formData: OAuth2PasswordRequestForm = Depends()):
    username, password = formData.username, formData.password
    hashedPassword = passwordContext.hash(password)
    print(f'username: {username}\npassword: {password}')
    cursor = db.cursor()
    cursor.execute(f'INSERT INTO USERS(userid, name, password) VALUES (default, \'{username}\', \'{hashedPassword}\')')
    db.commit()








