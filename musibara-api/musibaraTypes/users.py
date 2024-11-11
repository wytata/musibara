from pydantic import BaseModel
from fastapi import UploadFile

class TokenRequest(BaseModel):
    access_token: str
    refresh_token: str | None
