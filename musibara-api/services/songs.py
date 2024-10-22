import musicbrainzngs 
from config.db import db
from fastapi import Response, Request

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

async def databaseFindSong(song_name: str):
    return None

async def mbApiFindSong(song_name: str):
    pass

async def searchSongByName(song_name: str):
    results = await databaseFindSong(song_name)
    if results is not None:
        return results

    # no match in database -> hit the mb api
    work_search_result = musicbrainzngs.search_works(song_name, type="work")
    work_list = work_search_result['work-list']
    index = 0
    recording = work_list[index]['recording-relation-list'][0]['recording']

    song_name = work_list[index]['title']
    mb_id = work_list[index]['id']
    print(song_name)

    recording_result = musicbrainzngs.get_recording_by_id(recording['id'], includes=['isrcs'])
    print(recording_result)

    return work_list[index]
