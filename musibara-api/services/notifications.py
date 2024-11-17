from enum import EnumCheck
from .user_auth import get_id_username_from_cookie
from fastapi import Request, HTTPException, status
from config.db import get_db_connection
from .s3bucket_images import get_image_url
import datetime

async def get_and_format_url(columns, rows, type):
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
        columnNames.append("notificationtype")

        result = []
        for row in rows:
            #Getting temp image urls
            url = await get_image_url(row[image_index], row[bucket_index], row[key_index])
            row = list(row)
            row[image_index] = url
            result = dict(zip(columnNames, row))
            result["notificationtype"]= type

        return result

async def get_users_notifications(request:Request):
    user_id, username = get_id_username_from_cookie(request)

    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    query_likes = """
        SELECT 
            pl.userid, u.username, pl.postid, pl.createdts, u.profilephoto, i.bucket, i.key 
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
        ORDER BY
            pl.createdts
        DESC LIMIT 3;
        """
    
    query_comments = """
        SELECT 
            pc.userid, u.username, pc.content, pc.postid, pc.createdts, u.profilephoto, i.bucket, i.key 
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
        ORDER BY 
            pc.createdts
        DESC LIMIT 3;
        """

    query_comment_likes = """
        SELECT 
            pcl.userid, u.username, pc.postcommentid, pc.content, pc.postid, pcl.createdts, u.profilephoto, i.bucket, i.key 
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
        ORDER BY 
            pcl.createdts
        DESC LIMIT 100;
        """
    
    query_comment_replies = """
        SELECT 
            pc.parentcommentid, pc.userid, u.username, pc.postcommentid, pc.content, pc.postid, pc.createdts, u.profilephoto, i.bucket, i.key 
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
            WHERE userid =%s
        )
        GROUP BY
            pc.parentcommentid, pc.userid, u.username, pc.postcommentid, pc.content, pc.postid, pc.createdts, u.profilephoto, i.bucket, i.key
        ORDER BY 
            pc.createdts
        DESC LIMIT 3;
        """
    params = [user_id]
    
    try:  
        
        # Query database for likes, comments, and comment likes
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query_likes, params)
        rows_likes = cursor.fetchall()
        columns_likes = cursor.description
        cursor.execute(query_comments, params)
        rows_comments = cursor.fetchall()
        columns_comments = cursor.description
        cursor.execute(query_comment_likes, params)
        rows_comment_likes = cursor.fetchall()
        columns_comment_likes = cursor.description
        cursor.execute(query_comment_replies, params)
        rows_comment_replies = cursor.fetchall()
        columns_comment_replies = cursor.description
        cursor.close()
        
        likes_result = await get_and_format_url(columns_likes, rows_likes, "likes")  
        comments_result = await get_and_format_url(columns_comments, rows_comments, "comments")
        comment_likes_result = await get_and_format_url(columns_comment_likes, rows_comment_likes, "commentlikes")
        print(comment_likes_result)
        comment_replies_result = await get_and_format_url(columns_comment_replies, rows_comment_replies, "commentreplies")
        
        result = [likes_result, comments_result, comment_likes_result, comment_replies_result]
        result.sort(key=lambda x: x.get('createdts'), reverse=True)

        return result
        
        
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with notifications",
            headers={"WWW-Authenticate": "Bearer"},
        )



