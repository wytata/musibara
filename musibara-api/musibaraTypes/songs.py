from pydantic import BaseModel
from typing import Union

class SongRequest(BaseModel):
    song_name: str
    artist_name: Union[str, None] = None
