from config.db import get_db_connection
from typing import TypedDict, Tuple, List
from .user_auth import get_id_username_from_cookie
from fastapi import Request, HTTPException
from .s3bucket_images import get_image_url

POPULAR_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount,
        p.commentcount, p.createdts,p.title, p.herdid,
        u.username, h.name as herdname,
        CASE 
            WHEN EXISTS (
                SELECT 1
                FROM postlikes
                WHERE userid = %s AND postid = p.postid
            ) THEN TRUE
            ELSE FALSE
        END AS isliked,
        u.profilephoto, i.bucket as profilebucket, i.key as profilekey
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    LEFT JOIN 
        herds h ON h.herdid = p.herdid
    LEFT JOIN 
        images i ON i.imageid = u.profilephoto
    ORDER BY
        p.likescount DESC,
        p.createdts DESC
    LIMIT 10 
    OFFSET %s;
    """
                
FOLLOWED_USERS_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount,
        p.commentcount, p.createdts, p.title, p.herdid,
        u.username, h.name as herdname,
        CASE 
            WHEN EXISTS (
                SELECT 1
                FROM postlikes
                WHERE userid = %s AND postid = p.postid
            ) THEN TRUE
            ELSE FALSE
        END AS isliked,
        u.profilephoto, i.bucket as profilebucket, i.key as profilekey
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    LEFT JOIN 
        herds h ON h.herdid = p.herdid
    LEFT JOIN 
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
        p.postid, p.userid, p.content, p.likescount,
        p.commentcount, p.createdts, p.title, p.herdid,
        u.username, u.userid,  
        h.name as herdname, h.herdid,
        CASE 
            WHEN EXISTS (
                SELECT 1
                FROM postlikes
                WHERE userid = %s AND postid = p.postid
            ) THEN TRUE
            ELSE FALSE
        END AS isliked,
        u.profilephoto, i.bucket as profilebucket, i.key as profilekey
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    JOIN 
        herds h ON h.herdid = p.herdid
    LEFT JOIN 
        images i ON i.imageid = u.profilephoto
    ORDER BY
        p.likescount DESC,
        p.createdts DESC
    LIMIT 10 
    OFFSET %s;
    """
                
NEWEST_HERD_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount,
        p.commentcount, p.createdts, p.title, p.herdid,
        u.username, h.name as herdname, h.herdid,
        CASE 
            WHEN EXISTS (
                SELECT 1
                FROM postlikes
                WHERE userid = %s AND postid = p.postid
            ) THEN TRUE
            ELSE FALSE
        END AS isliked,
        u.profilephoto, 
        i.bucket as profilebucket, i.key as profilekey
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    JOIN 
        herds h ON h.herdid = p.herdid
    LEFT JOIN 
        images i ON i.imageid = u.profilephoto
    WHERE 
        f.userid = %s
    ORDER BY
        p.createdts DESC
    LIMIT 10
    OFFSET %s;
    """

TAGS_POSTS = """
    SELECT 
        p.postid, p.userid, p.content, p.likescount,
        p.commentcount, p.createdts,p.title, p.herdid,
        u.username, h.name as herdname, pt.mbid,
        CASE 
            WHEN EXISTS (
                SELECT 1
                FROM postlikes
                WHERE userid = %s AND postid = p.postid
            ) THEN TRUE
            ELSE FALSE
        END AS isliked,
        u.profilephoto, i.bucket as profilebucket, i.key as profilekey
    FROM 
        posts p 
    JOIN
        users u ON u.userid = p.userid
    LEFT JOIN 
        herds h ON h.herdid = p.herdid
    JOIN
        posttags pt ON pt.postid = p.postid
    LEFT JOIN 
        images i ON i.imageid = u.profilephoto
    WHERE
        LOWER(pt.mbid) = LOWER(%s)
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
        columnNames = [desc[0] for desc in cursor.description]
        cursor.close()
        db.close()

        post_tags = {}
        for row in rows:
            dict_result= dict(zip(columnNames, row))
            if dict_result.get("postid") in post_tags:
                post_tags[dict_result.get("postid")].append(dict_result)
            else: 
                post_tags[dict_result.get("postid")] = []
                post_tags[dict_result.get("postid")].append(dict_result)

        print(post_tags)
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
        else:
            columnNames.append(desc[0])
        
        if desc[0]=="profilebucket":
            bucket_index = i
        if desc[0]=="profilekey":
            key_index=i
        if desc[0]=="postid":
            post_id_index = i
        
    
    postids = []
    for row in rows:
        postids.append(row[post_id_index])
    post_tags_dict = get_tags_by_postids(postids)
    
    result = []
    for row in rows:
        #Getting temp image urls
        url = ""
        if row[image_index] and row[bucket_index] and row[key_index]:
            url = await get_image_url(row[image_index], row[bucket_index], row[key_index])

        #convert rows dict, assign url, and replace null/None with -1
        row = list(row)
        row[image_index] = url
        row = [value if value is not None else -1 for value in row]
        result_dict= dict(zip(columnNames, row))


        post_tags = post_tags_dict.get(result_dict.get("postid"))
        formatted_post_tags = []
        if post_tags:
            formatted_post_tags = [
                {
                "name": row.get("name"),
                "mbid": row.get("mbid"),
                "tag_type": row.get("resourcetype")
                }
                for row in post_tags
            ]
        result_dict["tags"] = formatted_post_tags
        result.append(result_dict)

    return result


async def get_users_feed(request: Request, offset:int):
    result = {}
    params = []
    user_id , username = get_id_username_from_cookie(request)

    if username is None or user_id is None:
        user_id =-1
        print("Popular posts")
        query = POPULAR_POSTS
    else: 
        print("Followed posts")
        params.append(user_id)
        query = FOLLOWED_USERS_POSTS
    params.append(user_id)
    params.append(offset)
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query, params )
        rows = cursor.fetchall()
        if not rows:
            query = POPULAR_POSTS
            params.clear()
            params.append(user_id)
            params.append(offset)
            cursor.execute(query,params )
            rows = cursor.fetchall()
        columns = cursor.description
        cursor.close()
        db.close()
        result = await get_and_format_url(columns, rows)
        return result

    except Exception as e:
        print(f'ERR: Could not get user feed... ({e})')
        raise HTTPException(status_code=500, detail="Could not get user feed")

async def get_herds_feed(request: Request, herd_id:int, offset:int):
    pass
    
async def get_tags_feed(request: Request, tag_mbid:str, offset:int):
    result = {}
    user_id , username = get_id_username_from_cookie(request)

    if username is None or user_id is None:
        user_id =-1
        
    params = [user_id, tag_mbid, offset]
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(TAGS_POSTS, params )
        rows = cursor.fetchall()
        columns = cursor.description
        cursor.close()
        db.close()
        result = await get_and_format_url(columns, rows)
        return result

    except Exception as e:
        print(f'ERR: Could not get user tag feed... ({e})')
        raise HTTPException(status_code=500, detail="Could not get user tag feed")
