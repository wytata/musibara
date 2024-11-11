from pydantic import BaseModel

class MusibaraPlaylistType(BaseModel):
    name: str
    description: str | None
    herd_id: int | None

