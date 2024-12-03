from fastapi import HTTPException
from config.aws import get_bucket_name, get_region
from config.db import get_db_connection

async def upload_image_db(key: str): 
    db, cursor = None, None
    try:
        region = get_region()
        bucket = get_bucket_name()
        db = get_db_connection()
        cursor = db.cursor()

        insert_image_query = "INSERT INTO images (imageid, region, bucket, key, url) VALUES (default, %s, %s, %s, NULL) RETURNING imageid"

        cursor.execute(insert_image_query, (region, bucket, key))
        db.commit()
        inserted_id = cursor.fetchone()[0]
        cursor.close()
        db.close()

        return inserted_id
    
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error with uploading db",
        )
        
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
