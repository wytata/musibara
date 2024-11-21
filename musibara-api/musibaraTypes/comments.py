from fastapi import APIRouter
from typing import TypedDict, List

postCommentsRouter = APIRouter()

class MusibaraCommentType(TypedDict):
    postid: int
    parentcommentid: int | None
    userid: int
    content: str
    #tags: str - maybe add this later ?

class MusibaraCommentLikeType(TypedDict):
    userid: int
    postcommentid: int