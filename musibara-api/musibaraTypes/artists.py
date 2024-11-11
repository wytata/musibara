from pydantic import BaseModel

class Artist(BaseModel):
    # TODO - more data in db for artist?
    mbid: str
    name: str
