import boto3
from config.aws import create_s3_client, get_bucket_name
from fastapi import FastAPI, File, UploadFile, HTTPException
import io
from config.db import get_db_connection

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
    try:
        expiration = 600  # 10minutes
        s3_client = create_s3_client()

        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': s3_file_name},
            ExpiresIn=expiration
        )

        return signed_url
    
    except Exception as e:
        print(f'ERR: Could not generate signed url... ({e})')
        raise HTTPException(status_code=500, detail="Could not generate signed url")

       
