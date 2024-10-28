from fastapi import APIRouter, Request
from services.homebar import get_homebar_cards
from typing import TypedDict, List, Tuple

homebar_router = APIRouter()


@homebar_router.get("/homebar")
async def response(request: Request):
    """
    list of herds that you follow, and list of people users follow returned all at once.  
    Returns:
        Return Title and image for each object
{
  "users": [
    {
      "name": "Tamara Herrera",
      "username": "schandler",
      "url": "https://placekitten.com/200/200"
    },
    {...}
  ],
  "herds": [
    {
      "name": "Folk Soul",
      "description": "We are a data generated community centered around Sanctuary! (that was a lie :P)",
      "url": "https://placekitten.com/200/200"
    }, 
    {...}
  ]  
}
  """
    return await get_homebar_cards(request)

