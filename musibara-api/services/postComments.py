from typing_extensions import deprecated
from config.db import db

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext


async def getCommentsByPostId(postId: int):
    cursor = db.cursor()
    cursor.execute(f'SELECT users.name, postcommentid, parentpostcomment, content FROM postcomments JOIN users ON postcomments.userid = users.userid WHERE postid = {postId}')
    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows]
    print(result)

    commentsList = {}
    parentCache = {}
    for comment in result:
        comment_id = comment['postcommentid']
        del comment['postcommentid']
        comment['replies'] = []
        if comment['parentpostcomment'] is None:
            commentsList[comment_id] = comment
        else:
            parentCache[comment_id] = comment['parentpostcomment']
            parentsList = []
            curr_id = comment_id
            while curr_id in parentCache:
                parentsList.append(parentCache[curr_id])
                curr_id = parentCache[curr_id]

            targetDict = commentsList
            for id in reversed(parentsList):
                targetDict = targetDict[id]['replies']

            targetDict[comment_id] = comment
        del comment['parentpostcomment']


    final_result = {
        "postid": postId,
        "comments": [
            commentsList[comment] for comment in commentsList
        ]
    }
    return final_result
