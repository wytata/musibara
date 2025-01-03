from pydantic import BaseModel
from typing import Union

class SongRequest(BaseModel):
    song_name: str
    artist_name: Union[str, None] = None
    page_num: Union[int, None] = None

class SaveSongRequest(BaseModel):
    title: str
    mbid: str
    artist: list[dict]
    isrc: str
    release_list: list[str]
