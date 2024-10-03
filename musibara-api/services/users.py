import json
from typing_extensions import deprecated
from config.db import db

from fastapi import APIRouter, Depends 
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
    result = cursor.fetchone()
    print(result)


async def userLogin(formData: OAuth2PasswordRequestForm = Depends()):
    print(formData)
    username, password = formData.username, formData.password
    authenticateUser(username, password)









