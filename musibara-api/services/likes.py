
from typing import List, Dict, TypedDict
from fastapi import HTTPException
from config.db import db

class PostInput(TypedDict):
    user: str
    postID: int
    like: bool

class PostOutput(TypedDict):
    postID: int
    likeCT: int

async def updatePostLikes(data: List[PostInput]) -> List[PostOutput]:
    result: List[PostOutput] = []

    if not data:
        raise HTTPException(status_code=400, detail="No data provided")

    postIDs = set(event["postID"] for event in data)

    params = []

    case_statements = []
    for event in data:
        params.append(event["postID"])
        params.append(event["like"])
        case_statements.append(f"WHEN postid = %s THEN CASE WHEN %s THEN 1 ELSE -1 END")

    case_statements_str = ' '.join(case_statements)

    where_placeholders = ', '.join(['%s'] * len(postIDs))

    batchUpdateQuery = f"""
    UPDATE posts
    SET likescount = likescount + 
        (CASE {case_statements_str} END)
    WHERE postid IN ({where_placeholders})
    RETURNING postid, likescount;
    """

    # TODO:
    #   The query is wrong because where must be unqiue.
    #   So likes for the same posts may need to be agrigated together

    # sample curl:
    """
    ~/p/C/48/musibara/musibara-api Update_post_likes !3 ?1 ❯ curl -X POST http://127.0.0.1:8000/api/postsActions/updateLikes \
     -H "Content-Type: application/json" \
     -d '[
           {"user": "user0", "postID": 1, "like": true},
           {"user": "user1", "postID": 1, "like": true},
           {"user": "user2", "postID": 1, "like": true},
           {"user": "user3", "postID": 1, "like": true},
           {"user": "user4", "postID": 1, "like": true},
           {"user": "user5", "postID": 1, "like": true},
           {"user": "user6", "postID": 1, "like": true},
           {"user": "user7", "postID": 1, "like": true},
           {"user": "user8", "postID": 1, "like": true},
           {"user": "user9", "postID": 1, "like": true}
         ]'

{"detail":"Could not update likes"}%
    """

    params.extend(postIDs)

    try:
        cursor = db.cursor()

        with open("queryOutput.txt", "w") as f:
            print(batchUpdateQuery, file=f)
            print("Parameters:", params, file=f)

        cursor.execute(batchUpdateQuery, params)

        rows = cursor.fetchall()

        columnNames = [desc[0] for desc in cursor.description]
        result = [dict(zip(columnNames, row)) for row in rows]

        db.commit()

    except Exception as e:
        print(f'ERR: Could not update post likes.... ({e})')
        raise HTTPException(status_code=500, detail="Could not update likes")

    finally:
        cursor.close()

    return result
