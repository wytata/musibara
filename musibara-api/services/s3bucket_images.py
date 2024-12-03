from config.aws import create_s3_client, get_bucket_name
from fastapi import FastAPI, File, UploadFile, HTTPException
import io
from config.db import get_db_connection
import asyncio
from datetime import datetime, timedelta
import time
import hashlib
from services.images import upload_image_db


S3_URL_EXPIRATION_TIME = 600 #10 minutes
S3_URL_EXPIRATION_TIME_OFFSET = 30 #30 seconds
IMAGE_CACHE_GARABAGE_COLLECTOR_SLEEP_TIME = 120 #2 minutes

image_cache: dict = {}
image_cache_lock = asyncio.Lock()

def run_threaded_garbage_collector():
    asyncio.run(thread_image_cache_garbage_collector())

async def thread_image_cache_garbage_collector():
    while True:
        time.sleep(IMAGE_CACHE_GARABAGE_COLLECTOR_SLEEP_TIME)
        print("Collecting image garbage...")
        async with image_cache_lock:
            keys_to_delete = []
            for key, value in image_cache.items():
                if value[1]<datetime.now():
                    keys_to_delete.append(key)
                    
            for key in keys_to_delete:
                del image_cache[key]


async def get_image_url(image_id:int, bucket_name=None, s3_file_key=None):
    async with image_cache_lock:
        url_already_created = image_cache.get(image_id)

        if url_already_created and url_already_created[1]<datetime.now():
            image_cache[image_id] = None
            url_already_created = None
        elif url_already_created:
            return url_already_created[0]

    if not bucket_name or not s3_file_key:
        query = f"SELECT bucket, key FROM images WHERE imageid={image_id};"
        db, cursor = None, None
        try:
            db = get_db_connection()
            cursor = db.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            cursor.close()
            if not rows:
                print(f'ERR: No rows returned')
                raise HTTPException(status_code=500, detail="No rows returned")
            row = rows[0]
            bucket_name = row[0]
            s3_file_key = row[1]
        
        except Exception as e:
            print(f'ERR: Could not get homebar cards... ({e})')
            raise HTTPException(status_code=500, detail="Could not get bucket and key for image to generate signed url")
        
        finally:
            if cursor:
                cursor.close()
            if db:
                db.close()
    

    expiration = S3_URL_EXPIRATION_TIME 
    off_set = 30 # 30 seconds
    current_time = datetime.now()
    expired_time = current_time + timedelta(seconds=(expiration-off_set))

 
    signed_url = await generate_signed_url(bucket_name, s3_file_key, expiration)
    
    url_with_expiration = (signed_url, expired_time)
    async with image_cache_lock:
        image_cache[image_id] = url_with_expiration
        
    return signed_url



async def upload_image_s3(file: UploadFile, bucket_name:str, s3_file_name:str):
    try:
        contents = await file.read()
        file_stream = io.BytesIO(contents)
        s3_client = create_s3_client()
        try:
            s3_client.get_object(Bucket=bucket_name,Key=s3_file_name)
            date_hash = hashlib.sha256(str(time.time()).encode("utf-8")).hexdigest()
            dot_index = s3_file_name.rfind(".")
            if dot_index == -1:
                s3_file_name += date_hash
            else:
                s3_file_name = s3_file_name[:dot_index] + date_hash + s3_file_name[dot_index:]
        except Exception as e:
            pass
        s3_client.upload_fileobj(file_stream, bucket_name, s3_file_name)
        print(f"Upload successful: {s3_file_name} to s3://{bucket_name}/{s3_file_name}")
        return await upload_image_db(s3_file_name)
    except Exception as e:
        print(f"Upload failed: {e}")


async def generate_signed_url(bucket_name: str, s3_file_name: str, expiration=None):
    if not expiration:
        expiration = S3_URL_EXPIRATION_TIME 

    try:
        s3_client = create_s3_client()

        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': s3_file_name},
            ExpiresIn= str(expiration)
        )
        
        return signed_url
    
    except Exception as e:
        print(f'ERR: Could not generate signed url... ({e})')
        raise HTTPException(status_code=500, detail="Could not generate signed url")

       
