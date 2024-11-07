from config.db import get_db_connection
from typing import TypedDict, Tuple, List
from .user_auth import get_auth_username
from fastapi import Request, HTTPException
from .s3bucket_images import get_image_url

async def get_homebar_cards(request: Request):
    result = {}
    username = get_auth_username(request)
    if username is None:
        query1 = 'SELECT name, username, profilephoto FROM users ORDER BY followercount DESC LIMIT 10;'
        query2 = 'SELECT name, description, imageid FROM herds ORDER BY usercount DESC LIMIT 10;'
    else: 
        query1 = 'SELECT * FROM users ORDER BY followercount DESC LIMIT 10;'
        query2 = 'SELECT * FROM herds ORDER BY usercount DESC LIMIT 10;'
        print('A USER NAME WAS FOUND IN THE COOKIES')
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(query1)
        rows = cursor.fetchall()
        
        columnNames = []
        image_index = -1
        for i, desc in enumerate(cursor.description):
            if desc[0]=="profilephoto":
                columnNames.append("url")
                image_index = i
            else:
                columnNames.append(desc[0])
            
        # recommend_users
        for row in rows:
            #Getting temp image urls
            url = await get_image_url(row[image_index])
            row = list(row)
            row[image_index] = url
            
            result["users"] = dict(zip(columnNames, row))
            
        
        cursor.execute(query2)
        rows = cursor.fetchall()
        
        columnNames = []
        image_index = -1
        for i, desc in enumerate(cursor.description):
            if desc[0]=="imageid":
                columnNames.append("url")
                image_index = i
            else:
                columnNames.append(desc[0])
            
        # recommended_herds
        for row in rows:
            #Getting temp image urls
            url = await get_image_url(row[image_index])
            row = list(row)
            row[image_index] = url
            
            result["herds"] = dict(zip(columnNames, row))


        cursor.close()
        return result

    except Exception as e:
        print(f'ERR: Could not get homebar cards... ({e})')
        raise HTTPException(status_code=500, detail="Could not get homebar cards")


    


