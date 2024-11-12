from pydantic import BaseModel

class Album(BaseModel):
    mbid: str
    name: str

class AlbumSearch(BaseModel):
    album_name: str
    artist_name: str | None

