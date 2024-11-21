from pydantic import BaseModel
from typing import Union

class ArtistSearch(BaseModel):
    artist_name: str
    page_num: Union[int, None] = None

class Artist(BaseModel):
    # TODO - more data in db for artist?
    mbid: str
    name: str
