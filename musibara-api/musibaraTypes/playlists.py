from pydantic import BaseModel
from typing import Union

class MusibaraPlaylistType(BaseModel):
    name: str
    description: str | None
    herd_id: int | None

class PlaylistImportRequest(BaseModel):
    song_list: list[dict]
    playlist_name: str
    external_id: str
