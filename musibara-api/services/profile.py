from .s3bucket_images import upload_image_s3 
from fastapi import File, UploadFile, Request
from .user_auth import get_auth_username
from config.aws import get_bucket_name

async def set_profile_image(request: Request, file:UploadFile): 
    if not file:
        return {"message": "No upload file sent"}

    username = get_auth_username(request)
    file_name = str(file.filename)
    print(file_name)
    bucket_name = get_bucket_name()
    await upload_image_s3(file, bucket_name, file_name)

    return {"message": "Sucess"}


