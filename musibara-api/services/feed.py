from config.db import get_db_connection
from typing import TypedDict, Tuple, List
from .user_auth import get_id_username_from_cookie
from fastapi import Request, HTTPException
from .s3bucket_images import get_image_url

POPULAR_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount, p.commentcount, p.createdts, p.title, p.herdid,
        u.username, u.userid, u.profilephoto, 
        i.bucket as profilebucket, i.key as profilekey, 
        h.name
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    JOIN 
        herds h ON h.herdid = p.herdid
    JOIN 
        images i ON i.imageid = u.profilephoto
    ORDER BY
        p.likescount DESC,
        p.createdts DESC
    LIMIT 10 
    OFFSET %s;
    """
                
FOLLOWED_USERS_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount, p.commentcount, p.createdts, p.title, p.herdid,
        u.username, u.userid, u.profilephoto, 
        i.bucket as profilebucket, i.key as profilekey, 
        h.name,
        
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    JOIN 
        herds h ON h.herdid = p.herdid
    JOIN 
        images i ON i.imageid = u.profilephoto
    JOIN 
        follows f ON f.followingid = p.userid
    WHERE 
        f.userid = %s
    ORDER BY
        p.createdts DESC
    LIMIT 10
    OFFSET %s;
    """

POPULAR_HERD_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount, p.commentcount, p.createdts, p.title, p.herdid,
        u.username, u.userid, u.profilephoto, 
        i.bucket as profilebucket, i.key as profilekey, 
        h.name, h.herdid
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    JOIN 
        herds h ON h.herdid = p.herdid
    JOIN 
        images i ON i.imageid = u.profilephoto
    ORDER BY
        p.likescount DESC,
        p.createdts DESC
    LIMIT 10 
    OFFSET %s;
    """
                
NEWEST_HERD_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount, p.commentcount, p.createdts, p.title, p.herdid,
        u.username, u.profilephoto, 
        i.bucket as profilebucket, i.key as profilekey, 
        h.name, h.herdid
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    JOIN 
        herds h ON h.herdid = p.herdid
    JOIN 
        images i ON i.imageid = u.profilephoto
    JOIN 
        follows f ON f.followingid = p.userid
    WHERE 
        f.userid = %s
    ORDER BY
        p.createdts DESC
    LIMIT 10
    OFFSET %s;
    """

def get_tags_by_postids(postids):
    if not postids:
        return {}
    try:
        db = get_db_connection()
        cursor = db.cursor()
        postids_tuple = tuple(postids)
        
        variables = ', '.join(['%s'] * len(postids_tuple))
        query = f"SELECT * FROM posttags WHERE postid IN ({variables});"
        cursor.execute(query, postids_tuple)

        rows = cursor.fetchall()
        post_tags = {}
        for row in rows:
            postid = row[0]
            tag = row[1]
            if postid not in post_tags:
                post_tags[postid] = []
            post_tags[postid].append(tag)
        
        return post_tags
    except Exception as e:
        print(f'ERR: Could not get user tags in feed... ({e})')
        raise HTTPException(status_code=500, detail="Could not get user tags in feed")
    
              
async def get_and_format_url(columns, rows):
    # Format image url
    columnNames = []
    image_index = -1
    bucket_index = -1
    key_index = -1
    post_id_index  = -1
    for i, desc in enumerate(columns):
        if desc[0]=="profilephoto":
            columnNames.append("url")
            image_index = i
        elif desc[0]=="profilebucket":
            bucket_index = i
        elif desc[0]=="profilekey":
            key_index=i
        else:
            columnNames.append(desc[0])
            
        if desc[0]=="postid":
            post_id_index = i
        
    
    postids = []
    for row in rows:
        postids.append(row[post_id_index])
    post_tags_dict = get_tags_by_postids(postids)
    
    result = []
    for row in rows:
        #Getting temp image urls
        url = await get_image_url(row[image_index], row[bucket_index], row[key_index])
        row = list(row)
        row[image_index] = url
        result_dict= dict(zip(columnNames, row))
        

        post_tags = post_tags_dict.get(result_dict["postid"])
        formatted_post_tags = []
        if post_tags:
            formatted_post_tags = [
                {
                    "name": tag["name"],
                    "mbid": tag["mbid"],
                    "tag_type": tag["resourcetype"]
                }
                for tag in post_tags
            ]
        result_dict["tags"] = formatted_post_tags
        
        result.append(result_dict)

    return result


async def get_users_feed(request: Request, offset:int):
    result = {}
    params = []
    user_id , username = get_id_username_from_cookie(request)

    if username is None or user_id is None:
        print("Popular posts")
        query = POPULAR_POSTS
    else: 
        print("Followed posts")
        params.append(user_id)
        query = FOLLOWED_USERS_POSTS
    params.append(offset)
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query, params )
        rows = cursor.fetchall()
        if not rows:
            query = POPULAR_POSTS
            
            cursor.execute(query, (offset,) )
            rows = cursor.fetchall()
        columns = cursor.description
        cursor.close()
        result = await get_and_format_url(columns, rows)
        return result

    except Exception as e:
        print(f'ERR: Could not get user feed... ({e})')
        raise HTTPException(status_code=500, detail="Could not get user feed")


