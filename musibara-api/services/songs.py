import musicbrainzngs 
from config.db import db
from fastapi import Response, Request

from musibaraTypes.songs import SongRequest

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

async def searchSongByName(request: SongRequest):
    song_name = request.song_name
    results = await databaseFindSong(song_name)
    work_search_result = musicbrainzngs.search_works(song_name, type="work")
    work_list = work_search_result['work-list']
    index = 0
    recording = work_list[index]['recording-relation-list'][0]['recording']

    song_name = work_list[index]['title']
    mb_id = work_list[index]['id']

    recording_result = musicbrainzngs.get_recording_by_id(recording['id'], includes=['isrcs'])
    print(recording_result)

    return recording_result
