from fastapi import APIRouter, File, UploadFile, Request
from services.s3bucket_images import generate_signed_url
from config.aws import get_bucket_name
from services.profile import set_profile_image 

profile_router = APIRouter()

@profile_router.post("/set/picture")
async def set_profile_photo_response(request: Request, file: UploadFile = File(...)):
    return await set_profile_image(request, file)

@profile_router.get("/picture")
async def get_profile_photo_response(request: Request):
    #needs to be implemented 
    pass


