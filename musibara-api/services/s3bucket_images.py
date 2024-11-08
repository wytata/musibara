from os import times
import boto3
from config.aws import create_s3_client, get_bucket_name
from fastapi import FastAPI, File, UploadFile, HTTPException
import io
from config.db import get_db_connection
import asyncio
from datetime import datetime, timedelta
import time


image_cache: dict = {}
image_cache_lock = asyncio.Lock()

def run_threaded_garbage_collector():
    asyncio.run(thread_image_cache_garbage_collector())

async def thread_image_cache_garbage_collector():
    time_to_sleep = 60
    while True:
        time.sleep(time_to_sleep)
        print("Collecting image garbage...")
        async with image_cache_lock:
            keys_to_delete = []
            for key, value in image_cache.items():
                if value[1]<datetime.now():
                    keys_to_delete.append(key)
                    
            for key in keys_to_delete:
                del image_cache[key]
                    
            

async def get_image_url(image_id:int):
    
    query = f"SELECT bucket, key FROM images WHERE imageid={image_id};"
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
        bucket = row[0]
        key = row[1]
        return await generate_signed_url(bucket, key)

    except Exception as e:
        print(f'ERR: Could not get homebar cards... ({e})')
        raise HTTPException(status_code=500, detail="Could not get signed image for get_image_url()")


async def upload_image_s3(file: UploadFile, bucket_name:str, s3_file_name:str):
    try:         
        contents = await file.read()
        file_stream = io.BytesIO(contents)
        s3_client = create_s3_client()
        s3_client.upload_fileobj(file_stream, bucket_name, s3_file_name)
        print(f"Upload successful: {s3_file_name} to s3://{bucket_name}/{s3_file_name}")
    except Exception as e:
        print(f"Upload failed: {e}")


async def generate_signed_url(bucket_name: str, s3_file_name: str):
    signed_url_name = f"{bucket_name}-{s3_file_name}"
    async with image_cache_lock:
        url_already_created = image_cache.get(signed_url_name)

        if url_already_created and url_already_created[1]<datetime.now():
            image_cache[signed_url_name] = None
            url_already_created = None
        elif url_already_created:
            return url_already_created[0]
    try:
        expiration = 600  # 10minutes
        off_set = 30 # 30 seconds
        current_time = datetime.now()
        expired_time = current_time + timedelta(seconds=(expiration-off_set))
        s3_client = create_s3_client()

        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': s3_file_name},
            ExpiresIn=expiration
        )
        
        url_with_expiration = (signed_url, expired_time)
        async with image_cache_lock:
            image_cache[signed_url_name] = url_with_expiration

        return signed_url
    
    except Exception as e:
        print(f'ERR: Could not generate signed url... ({e})')
        raise HTTPException(status_code=500, detail="Could not generate signed url")

       
