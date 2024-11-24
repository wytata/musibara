from datetime import datetime, timezone, timedelta
from sys import exception
from fastapi.responses import JSONResponse
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from typing_extensions import Annotated, deprecated
from config.db import get_db_connection
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, Response, Request, Form
from .user_auth import get_id_username_from_cookie
from .s3bucket_images import get_image_url
from services.users import get_current_user
from services.postTags import get_tags_by_postid

async def getHerdById(herd_id: int):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(f'SELECT * FROM herds WHERE herdid = \'{herd_id}\'')
    row = cursor.fetchone()
    if not row:
        return None

    columnNames = [desc[0] for desc in cursor.description]
    result = dict(zip(columnNames, row))

    return result

async def createHerd(image: UploadFile, name: str, description: str):
    db = get_db_connection()
    cursor = db.cursor()

    response = {}
    cursor.execute(f"SELECT * FROM herds where name = '{name}'")
    row = cursor.fetchone()
    if row is not None:
        response["msg"] = f"Herd {name} already exists!"
        return response

    url = "NULL"
    if image is not None:
        pass
        # TODO - logic for uploading image to s3 bucket and retrieving URL for database

    cursor.execute(f"INSERT INTO herds(herdid, name, description, usercount, url) VALUES (default, '{name}', '{description}', 0, {url}) RETURNING herdid")
    id = cursor.fetchone()[0]
    db.commit()

    response["id"] = id
    if id is not None:
        response["msg"] = f"Successfully created herd {name}"
    else:
        response["msg"] = f"Could not create herd {name}"

    return response

async def joinHerdById(request: Request, herd_id: int):
    user = await get_current_user(request)
    if user is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})
    id = user["userid"]

    try:
        db = get_db_connection()
        cursor = db.cursor()
        insert_statement = "INSERT INTO herdmembers (herdid, userid) VALUES (%s, %s)"
        cursor.execute(insert_statement, (herd_id, id, ))
        db.commit()
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Server could not satisfy follow request."})
    return None

async def exitHerdById(request: Request, herd_id: int):
    user = await get_current_user(request)
    if user is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})
    id = user["userid"]

    try:
        db = get_db_connection()
        cursor = db.cursor()
        delete_statement = "DELETE FROM herdmembers WHERE userid = %s AND herdid = %s"
        cursor.execute(delete_statement, (id, herd_id, ))
        db.commit()
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Server could not satisfy follow request."})
    return None


async def get_and_format_url(columns, rows):
    # Format image url
        columnNames = []
        image_index = -1
        bucket_index = -1
        key_index = -1
        for i, desc in enumerate(columns):
            if desc[0]=="imageid":
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
            result_dict = dict(zip(columnNames, row))
            result.append(result_dict)

        return result

async def get_all_users_herds(request: Request):
    user_id, _ = get_id_username_from_cookie(request)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    query = """
        SELECT 
            hu.herdid, h.name, h.description, h.usercount, h.imageid, h.createdts, i.bucket, i.key 
        FROM 
            herdsusers hu
        JOIN 
            herds h ON h.herdid = hu.herdid
        JOIN 
            images i ON i.imageid = h.imageid
        WHERE
            hu.userid = %s
        ORDER BY
            h.createdts
        ASC;
        """
    params = [user_id]
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        columns = cursor.description
        cursor.close()
        print(rows)
        results = await get_and_format_url(columns,rows)
        print(results)
        return results
    except Exception as e:
        print(f'ERR: Could not get herds user is in... ({e})')
        raise HTTPException(status_code=500, detail="Could not get herds a user is in")


async def get_all_herds(request: Request):
    
    query = """
    SELECT 
        h.herdid, h.name, h.description, h.usercount, h.imageid, h.createdts, i.bucket, i.key 
    FROM
        herds h
    JOIN 
        images i ON i.imageid = h.imageid
    ORDER BY
        h.usercount
    DESC;
    """

    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = cursor.description
        cursor.close()
        print(rows)
        results = await get_and_format_url(columns,rows)
        print(results)
        return results
    except Exception as e:
        print(f'ERR: Could not get all herds... ({e})')
        raise HTTPException(status_code=500, detail="Could not get all herds")

async def get_herd_posts_by_id(herd_id: int):
    db = get_db_connection()
    cursor = db.cursor()

    try:
        posts_query = "SELECT posts.postid, userid, content, likescount, commentcount, imageid, herdid, createdts, title, resourcetype, mbid, name FROM posts FULL JOIN posttags ON posts.postid = posttags.postid WHERE herdid = %s ORDER BY postid desc"
        cursor.execute(posts_query, (herd_id, ))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        all_posts = [dict(zip(columnNames, row)) for row in rows]

        if not all_posts:
            return None

        result = {}
        done = set()
        for post in all_posts:
            print(post)
            if post['postid'] in done:
                result[post['postid']]['tags'].append({'resourcetype':post['resourcetype'], 'mbid':post['mbid'], 'name':post['name']})
            else:
                done.add(post['postid'])
                if post['resourcetype'] is not None:
                    post['tags'] = [{'resourcetype':post['resourcetype'], 'mbid':post['mbid'], 'name':post['name']}]
                else:
                    post['tags'] = []
                if post['imageid'] is not None:
                    post['image_url'] = await get_image_url(post['imageid'])
                else:
                    post['image_url'] = None
                del(post['resourcetype'])
                del(post['mbid'])
                del(post['name'])
                result[post['postid']] = post
        return [result[postid] for postid in result.keys()]
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": f"Could not retrieve posts for herd with id {herd_id}"})
