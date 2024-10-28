from datetime import datetime, timezone, timedelta
from typing_extensions import Annotated, deprecated
from config.db import get_db_connection
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Form

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
