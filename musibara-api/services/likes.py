from typing import Final, Union, List, Dict, TypedDict, Union
from fastapi import status 
from config.db import db

class PostInput(TypedDict):
    user: str
    postID: int
    like: bool

class PostOutput(TypedDict):
    postID: int
    likeCT: int

async def updatePostLikes(data : List[PostInput]) -> List[PostOutput]:
    """
    NOTE: This should update like count on post and keep track of what users have liked

    WARNING: This implementation only handles updating post count so far
    """

    result: List[PostOutput] = []

    batchUpdateQuery: str = """
    UPDATE posts
    SET likescount = likescount + 
        SUM(CASE
            WHEN postid = %s AND %s THEN 1
            WHEN postid = %s AND NOT %s THEN -1
            ELSE 0
        END)
    WHERE postid IN (%s)
    RETURNING postid, likescount;
    """

    try:
        cursor = db.cursor()
        
        post_ids = tuple(event["postID"] for event in data)
        params = []
        
        for event in data:
            params.extend([event["postID"], event["like"], event["postID"], event["like"]])
        
        # Doing this to avoid sql injection.
        #   I read that this was good way to do it instead of using an ORM
        cursor.execute(batchUpdateQuery, params + [post_ids]) 
        
        rows = cursor.fetchall()
        
        columnNames = [desc[0] for desc in cursor.description]
        result = [dict(zip(columnNames, row)) for row in rows]
        
        db.commit() 

    except Exception as e:
        print(f'ERR: Could not update post likes \n\n (${e})')
        raise HTTPException(status_code=500, detail="Could not update likes")

    finally:
        cursor.close()
        
    return result

