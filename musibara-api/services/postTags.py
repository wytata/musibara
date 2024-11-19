import json
from typing import Union, List, Dict, Optional
from config.db import get_db_connection

async def set_post_tag(tags: list[dict], post_id: int):
    # Function to be called only after successful insertion of post into database
    if not all(tag['type'].lower() in ["song", "artist", "album"] for tag in tags):
        return None
    for tag in tags:
        print(tag)

