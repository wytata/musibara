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

async def generic_search(search_term: Annotated[str, Form()], table_name: str, match_column: str):
    search_query = f"SELECT *, LEVENSHTEIN(LOWER({match_column}), LOWER(%s)) FROM {table_name} ORDER BY LEVENSHTEIN(LOWER({match_column}), LOWER(%s)) ASC LIMIT 10"
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(search_query, (search_term, search_term, ))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        search_result = [dict(zip(columnNames, row)) for row in rows]
        return search_result
    except Exception as e:
        print(e)
        return False

async def search_playlists(request: Request, search_term: Annotated[str, Form()]):
    results = await generic_search(search_term, "playlists", "name")
    return results

async def search_herds(request: Request, search_term: Annotated[str, Form()]):
    results = await generic_search(search_term, "herds", "name")
    return results

async def search_users(request: Request, search_term: Annotated[str, Form()]):
    results = await generic_search(search_term, "users", "username")
    return results

async def search_tags(request: Request, search_term: Annotated[str, Form()]):
    results = await generic_search(search_term, "posttags", "name")
    return results
