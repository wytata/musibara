from fastapi import APIRouter
from typing import TypedDict, List

"""
NOTE: This route is prefixed with posts/
"""
postsRouter = APIRouter()

class MusibaraPostType(TypedDict):
    userid: int
    content: str
    likes: int

