import json
from typing import Union, List, Dict, Optional
from config.db import get_db_connection

async def set_post_tags(tags: list[dict], post_id: int):
    # Function to be called only after successful insertion of post into database
    # Note: treat return value False as error
    if not all(tag['type'].lower() in ["song", "artist", "album"] for tag in tags):
        return False
    try:
        db = get_db_connection()
        cursor = db.cursor()
        values_list = ','.join(cursor.mogrify(f"({str(post_id)}, %s, %s, %s)", tuple(tag.values())).decode('utf-8') for tag in tags)
        cursor.execute("INSERT INTO posttags (postid, resourcetype, mbid, name) VALUES " + values_list)
        db.commit()
        return True
    except Exception as e:
        print(e)
        return None

async def get_posts_with_tag(mbid: str):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM posts RIGHT JOIN posttags on posts.postid = posttags.postid WHERE posttags.mbid = %s", (mbid,))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        result = [dict(zip(columnNames, row)) for row in rows]
        return result
    except Exception as e:
        print(e)
        return None

