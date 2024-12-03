from typing_extensions import deprecated, final
from config.db import get_db_connection
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from musibaraTypes.comments import MusibaraCommentType, MusibaraCommentLikeType

def listifyReplies(comment_dict):
    if not comment_dict['replies']:
        comment_dict['replies'] = []
    comment_dict['replies'] = [comment_dict['replies'][id] for id in comment_dict['replies']]
    for reply in comment_dict['replies']:
        listifyReplies(reply)
    
async def createNewComment(comment: MusibaraCommentType):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        if comment['parentcommentid'] == None:
            cursor.execute(f'''
            INSERT INTO postcomments (postid, userid, content)
            VALUES (
                {comment['postid']},                  
                {comment['userid']},                                     
                '{comment['content']}'
            );''')

        else:
            cursor.execute(f'''
            INSERT INTO postcomments (postid, userid, parentcommentid, content)
            VALUES (
                {comment['postid']},                  
                {comment['userid']},                   
                {comment['parentcommentid']},                  
                '{comment['content']}'
            );''')
        db.commit()
        return {"msg": "success"}
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with creating new comment",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def getIsCommentLiked(user_id: int, post_comment_id: int):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        query = """
        SELECT EXISTS (
            SELECT 1
            FROM postcommentlikes
            WHERE userid = %s AND postcommentid = %s
        );
        """
        cursor.execute(query, (user_id, post_comment_id))
        return cursor.fetchone()[0]
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with getting comment like status",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def likeComment(postCommentLike: MusibaraCommentLikeType):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f'''
        INSERT INTO postcommentlikes (postcommentid, userid)
        VALUES ({postCommentLike['postcommentid']}, {postCommentLike['userid']});
        ''')
        db.commit()
        return {"msg": "success"}
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with liking comment",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def unlikeComment(postCommentUnlike: MusibaraCommentLikeType):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f'''
        DELETE FROM postcommentlikes
        WHERE postcommentid = {postCommentUnlike['postcommentid']} AND userid = {postCommentUnlike['userid']};
        ''')
        db.commit()
        return {"msg": "success"}
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with unliking comment",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

async def getCommentsByPostId(post_id: int):
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        query = """
            SELECT 
                users.name, postcommentid, parentcommentid,
                content, likescount, postcomments.createdts
            FROM 
                postcomments 
            JOIN 
                users ON postcomments.userid = users.userid 
            WHERE 
                postid = %s
            ORDER BY
                postcomments.createdts
            ASC
        """
        params = [post_id]
        cursor.execute(query, params)
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        cursor.close()
        db.close()
        result = [dict(zip(columnNames, row)) for row in rows]

        formattedResult = {}
        parentCache = {}
        for comment in result:
            comment_id = comment['postcommentid']
            del comment['postcommentid']
            comment['commentId'] = comment_id
            comment['replies'] = {}
            if comment['parentcommentid'] is None:
                formattedResult[comment_id] = comment
            else:
                parentCache[comment_id] = comment['parentcommentid']
                parentsList = []
                curr_id = comment_id
                while curr_id in parentCache:
                    parentsList.append(parentCache[curr_id])
                    curr_id = parentCache[curr_id]

                targetDict = formattedResult
                for id in reversed(parentsList):
                    targetDict = targetDict[id]['replies']

                targetDict[comment_id] = comment

            del comment['parentcommentid']

        final_result = {
            "postid": post_id,
            "comments": [formattedResult[id] for id in formattedResult]
        }
        
        for comment in final_result['comments']:
            listifyReplies(comment)

        return final_result

    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with getting comments via post id",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
