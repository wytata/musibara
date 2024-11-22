from pydantic import BaseModel
from typing import Union

class Album(BaseModel):
    mbid: str
    name: str

class AlbumSearch(BaseModel):
    album_name: str
    artist_name: Union[str, None] = None
    page_num: Union[int, None] = None

