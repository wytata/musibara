from typing_extensions import deprecated
from config.db import db

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext


async def getCommentsByPostId(postId: int):
    cursor = db.cursor()
    cursor.execute(f'SELECT * FROM postcomments WHERE postid = {postId}')
    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows]

    return result

