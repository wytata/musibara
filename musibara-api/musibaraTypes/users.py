from pydantic import BaseModel
from fastapi import UploadFile, File

class TokenRequest(BaseModel):
    access_token: str
    refresh_token: str | None

class User(BaseModel):
    username: str | None
    name: str | None
    email: str | None
    phone: str | None
    bio: str | None
    profile_photo: UploadFile | None
    banner_photo: UploadFile | None

