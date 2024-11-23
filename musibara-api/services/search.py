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

async def search_playlists(request: Request):
    pass

async def search_herds(request: Request):
    pass

async def search_users(request: Request):
    pass

async def search_tags(request: Request):
    pass
