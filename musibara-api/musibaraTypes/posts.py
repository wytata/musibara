from fastapi import APIRouter
from typing import TypedDict, List

"""
NOTE: This route is prefixed with posts/
"""
postsRouter = APIRouter()

class MusibaraPostType(TypedDict):
    username: str
    title: str
    content: str
    herdname: str
    tags: list[dict] | None

class MusibaraPostLikeType(TypedDict):
    userid: int
    postid: int
