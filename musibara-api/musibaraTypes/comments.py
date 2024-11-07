from fastapi import APIRouter
from typing import TypedDict, List

postCommentsRouter = APIRouter()

class MusibaraCommentType(TypedDict):
    postid: int
    parentcommentid: int
    userid: int
    content: str
    #tags: str - maybe add this later ?