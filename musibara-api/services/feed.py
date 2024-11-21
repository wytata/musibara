from config.db import get_db_connection
from typing import TypedDict, Tuple, List
from .user_auth import get_id_username_from_cookie, refresh_cookie
from fastapi import Request, HTTPException
from .s3bucket_images import get_image_url

async def get_and_format_url(columns, rows):
    # Format image url
        columnNames = []
        image_index = -1
        bucket_index = -1
        key_index = -1
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

        result = []
        for row in rows:
            #Getting temp image urls
            url = await get_image_url(row[image_index], row[bucket_index], row[key_index])
            row = list(row)
            row[image_index] = url
            result_dict= dict(zip(columnNames, row))
            result.append(result_dict)

        return result


async def get_users_feed(request: Request, offset:int):
    result = {}
    params = []
    user_id , username = get_id_username_from_cookie(request)

    if username is None or user_id is None:
        print("No Cookies received")
        query = """
                SELECT 
                    p.postid, p.content, p.likescount, p.commentcount, p.createdts, p.herdid,
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
                LIMIT 20 
                OFFSET %s;
                """
    else: 
        params.append(user_id)

        query = """
                SELECT 
                    p.postid, p.content, p.likescount, p.commentcount, p.createdts, p.herdid,
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
                JOIN 
                    follows f ON f.followingid = p.userid
                WHERE 
                    f.userid = %s
                ORDER BY
                    p.createdts DESC
                LIMIT 20
                OFFSET %s;
                """
    params.append(offset)
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query, params )
        rows = cursor.fetchall()
        columns = cursor.description
        cursor.close()
       
        result = await get_and_format_url(columns, rows)
        return result

    except Exception as e:
        print(f'ERR: Could not get user feed... ({e})')
        raise HTTPException(status_code=500, detail="Could not get user feed")


    

