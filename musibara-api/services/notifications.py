from enum import EnumCheck
from .user_auth import get_id_username_from_cookie
from fastapi import Request, HTTPException, status
from config.db import get_db_connection
from .s3bucket_images import get_image_url

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
        DESC LIMIT 100;
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
        DESC LIMIT 100;
        """

    """
    NOTE: for reference
    
    CREATE TABLE IF NOT EXISTS postcommentlikes(
        postcommentid INTEGER,
        userid INTEGER,
        createdts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (postcommentid) REFERENCES postcomments(postcommentid),
        FOREIGN KEY (userid) REFERENCES users(userid)
    );
    """
    query_comment_likes = """
        SELECT 
            pcl.userid, u.username, pc.content, pc.postid, pcl.createdts, u.profilephoto, i.bucket, i.key 
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
    
    # user who commented, your parent comment, image of user who commented
    query_comment_replys = """
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
            WHERE userid =2
        )
        GROUP BY
            pc.parentcommentid, pc.userid, u.username, pc.postcommentid, pc.content, pc.postid, pc.createdts, u.profilephoto, i.bucket, i.key
        ORDER BY 
            pc.createdts
        DESC LIMIT 100;
        """
    params = [username]
    
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
        cursor.close()
        
        # Format likes with image url
        columnNames = []
        image_index = -1
        bucket_index = -1
        key_index = -1
        for i, desc in enumerate(columns_likes):
            if desc[0]=="profilephoto":
                columnNames.append("url")
                image_index = i
            elif desc[0]=="bucket":
                bucket_index = i
            elif desc[0]=="key":
                key_index=i
            else:
                columnNames.append(desc[0])

        result_likes = []
        for row in rows_likes:
            #Getting temp image urls
            url = await get_image_url(row[image_index], row[bucket_index], row[key_index])
            row = list(row)
            row[image_index] = url
            result_likes = dict(zip(columnNames, row))
            
            
        # Format comments with image url
        columnNames = []
        image_index = -1
        bucket_index = -1
        key_index = -1
        for i, desc in enumerate(columns_comments):
            if desc[0]=="profilephoto":
                columnNames.append("url")
                image_index = i
            elif desc[0]=="bucket":
                bucket_index = i
            elif desc[0]=="key":
                key_index=i
            else:
                columnNames.append(desc[0])

        result_comments = []
        for row in rows_comments:
            #Getting temp image urls
            url = await get_image_url(row[image_index], row[bucket_index], row[key_index])
            row = list(row)
            row[image_index] = url
            result_comments = dict(zip(columnNames, row))
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=status.HTTP_500,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )



