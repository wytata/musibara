from config.db import get_db_connection, release_db_connection
from typing import TypedDict, Tuple, List
from .user_auth import get_id_username_from_cookie, refresh_cookie
from fastapi import Request, HTTPException
from .s3bucket_images import get_image_url

POPULAR_USERS = """
                SELECT 
                    u.name, u.username, u.profilephoto, i.bucket, i.key 
                FROM 
                    users u 
                JOIN 
                    images i ON i.imageid = u.profilephoto
                ORDER BY
                    followercount 
                DESC LIMIT 10;
                """
POPULAR_HERDS = """
                SELECT 
                    h.herdid, h.name, h.description, h.imageid, i.bucket, i.key
                FROM
                    herds h
                JOIN 
                    images i ON i.imageid = h.imageid
                ORDER BY
                    usercount 
                DESC LIMIT 10;
                """

async def get_homebar_cards(request: Request):
    result = {}
    params = []
    _ , username = get_id_username_from_cookie(request)

    if username is None:
        print("No Cookies received")
        query1 = POPULAR_USERS
        query2 = POPULAR_HERDS 
    else: 
        params.append(username)
        params.append(username)
        query1 = """
            SELECT 
                u.userid, u.username, u.profilephoto, i.bucket, i.key, COUNT(pl.postid) as total_likes
            FROM 
                users u
            JOIN 
                follows f ON u.userid = f.followingid
            JOIN 
                posts p ON u.userid = p.postid
            LEFT JOIN 
                postlikes pl ON pl.postid = p.postid
            JOIN
                images i ON i.imageid = u.profilephoto

            WHERE 
                    f.userid = (SELECT userid FROM users WHERE username = %s)
                AND
                    u.username != %s
            GROUP BY
                u.userid, u.username, u.profilephoto, i.bucket, i.key
            ORDER BY 
                total_likes 
            DESC LIMIT 10;
            """

        query2 = """
            SELECT 
                h.herdid, h.name, h.imageid, i.bucket, i.key, COUNT(pl.postid) as total_likes
            FROM 
                herds h
            JOIN 
                herdsusers hu ON hu.herdid = h.herdid
            JOIN 
                posts p ON h.herdid = p.herdid
            LEFT JOIN 
                postlikes pl ON pl.postid = p.postid
            JOIN
                images i ON i.imageid = h.imageid

            WHERE 
                    hu.userid = (SELECT userid FROM users WHERE username = %s)
                AND
                    pl.userid = (SELECT userid FROM users WHERE username = %s)
            GROUP BY
                h.herdid, h.name, h.imageid, i.bucket, i.key
            ORDER BY 
                total_likes 
            DESC LIMIT 10;
            """
            
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        rows = None
        if username:
            cursor.execute(query1, params )
            rows = cursor.fetchall()
        else:
            cursor.execute(query1)

        rows = cursor.fetchall()
        if not rows: 
            cursor.execute(POPULAR_USERS)
            rows = cursor.fetchall()
        

        columnNames = []
        image_index = -1
        bucket_index = -1
        key_index = -1
        for i, desc in enumerate(cursor.description):
            if desc[0]=="profilephoto":
                columnNames.append("url")
                image_index = i
            elif desc[0]=="bucket":
                bucket_index = i
            elif desc[0]=="key":
                key_index=i
            else:
                columnNames.append(desc[0])
        # recommend_users
        result["users"] = []
        for row in rows:
            #Getting temp image urls
            url = await get_image_url(row[image_index], row[bucket_index], row[key_index])
            row = list(row)
            row[image_index] = url
            result["users"].append(dict(zip(columnNames, row)))
            
        if username:
            cursor.execute(query2, params )
        else:
            cursor.execute(query2)
            
        rows = cursor.fetchall()
        if not rows:
            cursor.execute(POPULAR_HERDS)
            rows = cursor.fetchall()
        
        columnNames = []
        image_index = -1
        bucket_index = -1
        key_index = -1
        for i, desc in enumerate(cursor.description):
            if desc[0]=="imageid":
                columnNames.append("url")
                image_index = i
            elif desc[0]=="bucket":
                bucket_index = i
            elif desc[0]=="key":
                key_index=i
            else:
                columnNames.append(desc[0])
            
        # recommended_herds
        result["herds"] = []
        for row in rows:
            #Getting temp image urls
            url = await get_image_url(row[image_index], row[bucket_index], row[key_index])
            row = list(row)
            row[image_index] = url
            
            result["herds"].append(dict(zip(columnNames, row)))

        return result

    except Exception as e:
        print(f'ERR: Could not get homebar cards... ({e})')
        raise HTTPException(status_code=500, detail="Could not get homebar cards")
    
    finally:
        if cursor:
            cursor.close()
        if db:
            release_db_connection(db)