import json
from typing import Union, List, Dict, Optional
from config.db import get_db_connection

from musibaraTypes.posts import MusibaraPostType

Post = Dict[str, Union[str, int]]

async def getHomePosts() -> Optional[List[Post]]:
    data: Optional[List[Post]] = None

    try:
        with open("sampleData/posts.json") as postData:
            data = json.load(postData)

    except FileNotFoundError:
        print("File not found.")
    
    except json.JSONDecodeError:
        print("Error decoding JSON.")
    
    return data

async def createNewPost(post: MusibaraPostType):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(
    f'INSERT INTO POSTS(postid, userid, content, likescount) VALUES(default, \'{post["userid"]}\', \'{post["content"]}\', \'{post["likes"]}\')'
    )
    db.commit()
    return {"msg": "success"}

async def getPost(postId: int):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'''SELECT 
posts.postid,
    users.username,
    posts.title,
    posts.content,
    posts.likescount,
    posts.commentcount as numcomments,
    posts.createdts as createdAt
FROM 
    posts
JOIN 
    users ON posts.userid = users.userid
WHERE
    postid = {postId};''')

    rows = cursor.fetchone()
    columnNames = [desc[0] for desc in cursor.description]
    result = dict(zip(columnNames, rows))
    print(result)
    return result

async def getPostsByUserId(username: str):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'''SELECT 
    posts.postid,
    users.username,
    posts.title,
    posts.content,
    posts.likescount,
    posts.commentcount as numcomments,
    posts.createdts as createdAt
FROM 
    posts
JOIN 
    users ON posts.userid = users.userid
WHERE
    users.username = %s;''', (username,))

    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    result = [dict(zip(columnNames, row)) for row in rows]
    print(result)
    return result
    

async def deletePost(postId: int):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'DELETE FROM POSTS WHERE postid = {postId}')
    db.commit()
    return {"msg": f'deleted post {postId}'}


