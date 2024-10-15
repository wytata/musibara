import json
from typing import Union, List, Dict, Optional
from config.db import db

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
    cursor = db.cursor()
    cursor.execute(
    f'INSERT INTO POSTS(postid, userid, content, likescount) VALUES(default, \'{post["userid"]}\', \'{post["content"]}\', \'{post["likes"]}\')'
    )
    db.commit()
    return {"msg": "success"}
