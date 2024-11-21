from fastapi import APIRouter
from typing import TypedDict, List

"""
NOTE: This route is prefixed with posts/
"""
postsRouter = APIRouter()

class MusibaraPostTag(TypedDict):
    tag_type: str
    mbid: str
    name: str

class MusibaraPostType(TypedDict):
    username: str
    title: str
    content: str
    herdname: str
    tags: list[MusibaraPostTag] | None

class MusibaraPostLikeType(TypedDict):
    userid: int
    postid: int
