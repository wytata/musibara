from config.db import get_db_connection
from typing import TypedDict, Tuple, List
from .user_auth import get_auth_username
from fastapi import Request, HTTPException

async def get_homebar_cards(request: Request):
    result = {}
    username = get_auth_username(request)
    if username is None:
        query1 = 'SELECT name, username, url FROM users ORDER BY followercount DESC LIMIT 10;'
        query2 = 'SELECT name, description, url FROM herds ORDER BY usercount DESC LIMIT 10;'
    else: 
        query1 = 'SELECT * FROM users ORDER BY followercount DESC LIMIT 10;'
        query2 = 'SELECT * FROM herds ORDER BY usercount DESC LIMIT 10;'
        print('A USER NAME WAS FOUND IN THE COOKIES')
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query1)
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        # recommend_users
        result["users"]= [dict(zip(columnNames, row)) for row in rows]
        
        cursor.execute(query2)
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        # recommended_herds
        result["herds"]= [dict(zip(columnNames, row)) for row in rows]

        cursor.close()
        return result

    except Exception as e:
        print(f'ERR: Could not get homebar cards... ({e})')
        raise HTTPException(status_code=500, detail="Could not get homebar cards")


    


