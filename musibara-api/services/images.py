from config.aws import get_bucket_name, get_region
from config.db import get_db_connection

async def upload_image_db(key: str): 
    region = get_region()
    bucket = get_bucket_name()
    db = get_db_connection()
    cursor = db.cursor()

    insert_image_query = "INSERT INTO images (imageid, region, bucket, key, url) VALUES (default, %s, %s, %s, NULL) RETURNIN imageid"

    cursor.execute(insert_image_query, (region, bucket, key))
    inserted_id = cursor.fetchone()[0]

    return inserted_id
