from pydantic import BaseModel
from fastapi import UploadFile

class TokenRequest(BaseModel):
    access_token: str
    refresh_token: str | None

class User(BaseModel):
    username: str | None
    email: str | None
    phone: str | None
    bio: str | None

