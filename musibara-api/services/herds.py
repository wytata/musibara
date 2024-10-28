from datetime import datetime, timezone, timedelta
from typing_extensions import Annotated, deprecated
from config.db import get_db_connection
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, Response, Request, Form

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
