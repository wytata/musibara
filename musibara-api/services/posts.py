import json
from typing import Union, List, Dict, Optional
from config.db import get_db_connection
from services.postTags import set_post_tags, get_tags_by_postid
from fastapi import Request, HTTPException

from musibaraTypes.posts import MusibaraPostType, MusibaraPostLikeType
from services.user_auth import get_id_username_from_cookie

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
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()

        herd_clause = f"(SELECT herdid FROM herds WHERE name = '{post['herdname']}')" if post['herdname'] else "NULL"
        
        cursor.execute(f'''
            INSERT INTO posts (userid, content, likescount, commentcount, imageid, herdid, createdts, title)
            VALUES (
                (SELECT userid FROM users WHERE username = '{post['username']}'),
                '{post['content']}',
                0,
                0,
                NULL,
                {herd_clause},
                NOW(),              
                '{post['title']}'
            )
            RETURNING postid;
            ''')
        post_id = cursor.fetchone()[0]
        db.commit()
        cursor.close()
        db.close()
        tags_transform = []
        for tag in post['tags']:
            if tag["tag_type"] == "albums":
                tags_transform.append({
                    "tag_type": "albums",
                    "mbid": tag["release-list"][0]["id"] if "release-list" in tag else tag["id"],
                    "name": tag["title"] if "title" in tag else tag["name"]
                })
            else:
                tags_transform.append({
                    "tag_type": tag["tag_type"],
                    "mbid": tag["mbid"] if "mbid" in tag else tag["id"],
                    "name": tag["title"] if "title" in tag else tag["name"]
                })

        #tags_transform = [
        #    {
        #        "tag_type": tag["tag_type"],
        #        "mbid": tag["mbid"] if "mbid" in tag else tag["id"],
        #        "name": tag["title"] if "title" in tag else tag["name"]
        #    }
        #    for tag in post['tags']
        #]
        await set_post_tags(tags_transform, post_id)
        return {"msg": "success"}
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with creating new post",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def getPost(request: Request, postId: int):
    id, username = get_id_username_from_cookie(request)
    if id is None:
        id = -1
        
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f'''SELECT 
            posts.postid,
                users.username,
                posts.title,
                posts.content,
                posts.likescount,
                posts.commentcount as numcomments,
                posts.createdts as createdAt,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM postlikes
                        WHERE userid = %s AND postid = %s
                    ) THEN TRUE
                    ELSE FALSE
                END AS isliked
            FROM 
                posts
            JOIN 
                users ON posts.userid = users.userid
            WHERE
                postid = %s;''', (id, postId, postId, )
            )

        rows = cursor.fetchone()
        columnNames = [desc[0] for desc in cursor.description]
        result = dict(zip(columnNames, rows))
        tags = await get_tags_by_postid(postId)
        result["tags"] = tags
        return result
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with fetching post",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def getIsLiked(user_id: int, post_id: int):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        query = """
        SELECT EXISTS (
            SELECT 1
            FROM postlikes
            WHERE userid = %s AND postid = %s
        );
        """
        cursor.execute(query, (user_id, post_id))
        return cursor.fetchone()[0]
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with getting liked status of post",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def likePost(postLike: MusibaraPostLikeType):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f'''
        INSERT INTO postlikes (postid, userid)
        VALUES ({postLike['postid']}, {postLike['userid']});
        ''')
        db.commit()
        return {"msg": "success"}

    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with liking post",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def unlikePost(postUnlike: MusibaraPostLikeType):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f'''
        DELETE FROM postlikes
        WHERE postid = {postUnlike['postid']} AND userid = {postUnlike['userid']};
        ''')
        db.commit()
        return {"msg": "success"}

    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with unliking post",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def getPostsByUsername(username: str):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f'''
            SELECT 
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
                users.username = %s
            ORDER BY
                createdAt DESC
            ;''', (username,)
            )

        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        cursor.close()
        db.close()
        result = [dict(zip(columnNames, row)) for row in rows]
        for post in result:
            post_tags = await get_tags_by_postid(post["postid"])
            formatted_post_tags = [
                {
                    "name": tag["name"],
                    "mbid": tag["mbid"],
                    "tag_type": tag["resourcetype"]
                }
                for tag in post_tags
            ]
            post["tags"] = formatted_post_tags
        return result
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with getting posts by username",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
    

async def deletePost(postId: int):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f'DELETE FROM POSTS WHERE postid = {postId}')
        db.commit()
        return {"msg": f'deleted post {postId}'}

    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with getting posts by username",
        )

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


