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

async def search_playlists(search_term: Annotated[str, Form()]):
    search_query = f"SELECT *, LEVENSHTEIN(LOWER(name), LOWER(%s)) FROM playlists ORDER BY LEVENSHTEIN(LOWER(name), LOWER(%s)) ASC LIMIT 10"
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(search_query, (search_term, search_term, ))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        search_result = [dict(zip(columnNames, row)) for row in rows]
        for result in search_result:
            if result['imageid']:
                image_url = await get_image_url(result['imageid'])
                result['image_url'] = image_url
        return search_result
    except Exception as e:
        print(e)
        return False

async def search_herds(search_term: Annotated[str, Form()]):
    search_query = f"SELECT *, LEVENSHTEIN(LOWER(name), LOWER(%s)) FROM herds ORDER BY LEVENSHTEIN(LOWER(name), LOWER(%s)) ASC LIMIT 10"
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(search_query, (search_term, search_term, ))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        search_result = [dict(zip(columnNames, row)) for row in rows]
        for result in search_result:
            if result['imageid']:
                image_url = await get_image_url(result['imageid'])
                result['image_url'] = image_url
        return search_result
    except Exception as e:
        print(e)
        return False

async def search_users(search_term: Annotated[str, Form()]):
    search_query = f"SELECT username, name, bio, followercount, followingcount, postscount, profilephoto, LEVENSHTEIN(LOWER(username), LOWER(%s)) FROM users ORDER BY LEVENSHTEIN(LOWER(username), LOWER(%s)) ASC LIMIT 10"
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(search_query, (search_term, search_term, ))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        search_result = [dict(zip(columnNames, row)) for row in rows]
        for result in search_result:
            if result['profilephoto']:
                image_url = await get_image_url(result['profilephoto'])
                result['image_url'] = image_url
        return search_result
    except Exception as e:
        print(e)
        return False

async def search_tags(search_term: Annotated[str, Form()]):
    search_query = f"SELECT *, LEVENSHTEIN(LOWER(name), LOWER(%s)) FROM posttags ORDER BY LEVENSHTEIN(LOWER(name), LOWER(%s)) ASC LIMIT 10"
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(search_query, (search_term, search_term, ))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        search_results = [dict(zip(columnNames, row)) for row in rows]
        for result in search_results:
            del(result["postid"])
            del(result["levenshtein"])
        tags = []
        seen = set()
        for result in search_results:
            print(seen)
            if result["mbid"].strip() not in seen:
                seen.add(result["mbid"].strip())
                tags.append(result)
        return tags
    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Server failed to satisfy your search request."})
