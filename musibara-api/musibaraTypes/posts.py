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
    #tags: str - add this once the functionality is there on frontend
    #image: str - maybe add this later ?

    
    # postid: int
    # userid: int
    # content: str
    # likescount: int
    # commentcount: int
    # imageid: int
    # herdid: int
    # createdts: str
    # title: str

