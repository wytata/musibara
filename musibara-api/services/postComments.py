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

    formattedResult = {}
    parentCache = {}
    for comment in result:
        comment_id = comment['postcommentid']
        del comment['postcommentid']
        comment['children'] = {}
        if comment['parentpostcomment'] is None:
            formattedResult[comment_id] = comment
        else:
            parentCache[comment_id] = comment['parentpostcomment']
            parentsList = []
            curr_id = comment_id
            while curr_id in parentCache:
                parentsList.append(parentCache[curr_id])
                curr_id = parentCache[curr_id]

            targetDict = formattedResult
            for id in reversed(parentsList):
                targetDict = targetDict[id]['children']

            targetDict[comment_id] = comment

            print(parentsList)

    print(formattedResult)
    print(parentCache)
    return formattedResult
