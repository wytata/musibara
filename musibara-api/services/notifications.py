from .user_auth import get_id_username_from_cookie
from fastapi import Request, HTTPException, status
from config.db import get_db_connection
from .s3bucket_images import get_image_url
import datetime

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
            elif desc[0]=="bucket":
                bucket_index = i
            elif desc[0]=="key":
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

async def get_users_notifications(request:Request, offset:int):
    user_id, username = get_id_username_from_cookie(request)
    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    
    query_notifications = """
    (
        SELECT 
            pl.userid, 
            u.username, 
            pl.postid, 
            pl.createdts, 
            NULL AS content, 
            NULL AS postcommentid,
            'likes' AS notification_type,
            u.profilephoto, 
            i.bucket, 
            i.key
        FROM
            postlikes pl
        JOIN 
            posts p ON pl.postid = p.postid
        JOIN 
            users u ON pl.userid = u.userid
        JOIN 
            images i ON i.imageid = u.profilephoto
        WHERE
            p.userid= %s
    )
    UNION ALL
    (
        SELECT 
            pc.userid, 
            u.username, 
            pc.postid, 
            pc.createdts, 
            pc.content, 
            pc.postcommentid,
            'comments' AS notificationtype,
            u.profilephoto, 
            i.bucket, 
            i.key
            
        FROM 
            postcomments pc
        JOIN 
            posts p ON pc.postid = p.postid
        JOIN 
            users u ON pc.userid = u.userid
        JOIN 
            images i ON i.imageid = u.profilephoto
        WHERE 
            p.userid= %s
    )
    UNION ALL
    (
        SELECT 
            pcl.userid, 
            u.username, 
            pc.postid, 
            pcl.createdts, 
            pc.content, 
            pcl.postcommentid,
            'commentlikes' AS notificationtype,
            u.profilephoto, 
            i.bucket, 
            i.key
        FROM 
            postcommentlikes pcl
        JOIN
            postcomments pc ON pc.postcommentid = pcl.postcommentid
        JOIN
            users u ON pcl.userid = u.userid
        JOIN
            images i ON i.imageid = u.profilephoto
        WHERE 
            pc.userid= %s
    )
    UNION ALL
    (
        SELECT 
            u.userid, 
            u.username, 
            pc.postid, 
            pc.createdts, 
            pc.content, 
            pc.postcommentid,
            'commentreplies' AS notificationtype,
            u.profilephoto, 
            i.bucket, 
            i.key
        FROM 
            postcomments pc
        JOIN 
            users u ON pc.userid = u.userid
        JOIN 
            images i ON i.imageid = u.profilephoto
        WHERE pc.parentcommentid IN
        (
            SELECT postcommentid 
            FROM postcomments 
            WHERE userid = %s
        )
    )
    UNION ALL
    (
        SELECT 
            f.userid, 
            u.username, 
            NULL AS postid, 
            f.createdts, 
            NULL AS content,
            NULL AS postcommentid, 
            'follows' AS notificationtype,
            u.profilephoto, 
            i.bucket, 
            i.key
        FROM
            follows f
        JOIN
            users u ON u.userid = f.userid
        JOIN 
            images i ON i.imageid = u.profilephoto
        WHERE
            f.followingid = %s
    )
    ORDER BY createdts DESC
    LIMIT 20 
    OFFSET %s;
        """
    
    params = [user_id] * 5
    params.append(offset)
    
    try:  
        
        # Query database for likes, comments, and comment likes
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query_notifications, params)
        rows = cursor.fetchall()
        columns = cursor.description
        cursor.close()
        
        result = await get_and_format_url(columns, rows)  
        return result
        
        
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with notifications",
            headers={"WWW-Authenticate": "Bearer"},
        )



