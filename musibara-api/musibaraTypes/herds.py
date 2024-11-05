from pydantic import BaseModel
from fastapi import UploadFile

class Herd(BaseModel):
    herd_id: int
    name: str
    description: str
    user_count: int
    image: UploadFile | None
