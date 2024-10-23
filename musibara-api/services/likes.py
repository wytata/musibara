
from typing import List, Dict, TypedDict, Tuple
from fastapi import HTTPException
from config.db import db

class PostInput(TypedDict):
    user: str
    postID: int
    like: bool

class PostOutput(TypedDict):
    postID: int
    likeCT: int

"""
NOTE: This file currently updates like count for posts

WARNING: This does not update what user likes what post table yet
"""
def count_likes(data: List[PostInput]) -> Dict[int, int]:
    result = {}
    for event in data:
        if event['like']:
            if event['postID'] not in result:
                result[event["postID"]] = 1 
            else: 
                result[event["postID"]] = result[event["postID"]] + 1 
        elif not event['like']:
            if event['postID'] not in result:
                result[event["postID"]] = -1
            else: 
                result[event["postID"]] = result[event["postID"]] - 1 
    return result

def process_query(data: List[PostOutput] ) -> Tuple[str, List[int]]: 
    aggrigated_likes: Dict[int, int] = count_likes(data)
    postIDs = set(event["postID"] for event in data)

    params = []

    case_statements = []
    for user_id, like_count in aggrigated_likes.items():
        params.append(user_id)
        params.append(like_count)
        case_statements.append(f"WHEN postid = %s THEN %s")

    case_statements_str = ' '.join(case_statements)

    where_placeholders = ', '.join(['%s'] * len(postIDs))

    batchUpdateQuery = f"""
    UPDATE posts
        SET likescount = likescount + 
            (CASE 
                {case_statements_str}
                ELSE 0 
            END)
        WHERE postid IN ({where_placeholders})
        RETURNING postid, likescount;   
    """

    params.extend(postIDs)
    return (batchUpdateQuery, params)


async def updatePostLikes(data: List[PostInput]) -> List[PostOutput]:
    result: List[PostOutput] = []
    
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")


    query, params = process_query(data)
    
    try:
        cursor = db.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        result = [
            {"postID": row[columnNames.index("postid")], "likeCT": row[columnNames.index("likescount")]}
            for row in rows
        ]

        db.commit()

    except Exception as e:
        print(f'ERR: Could not update post likes.... ({e})')
        raise HTTPException(status_code=500, detail="Could not update likes")

    finally:
        cursor.close()

    return result

"""
TEST  Curl 

    curl -X POST http://127.0.0.1:8000/api/postsActions/updateLikes \
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


