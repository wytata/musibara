from pydantic import BaseModel

class MusibaraPlaylistType(BaseModel):
    name: str
    description: str | None
    user_id: int | None
    herd_id: int | None

