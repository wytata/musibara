from fastapi import APIRouter
from typing import TypedDict, List

"""
NOTE: This route is prefixed with posts/
"""
postsRouter = APIRouter()

class MusibaraPostType(TypedDict):
    user: str
    timestamp: str
    content: str
    likes: int
    comments: int

