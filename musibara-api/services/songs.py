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
    song_query = f'"{request.song_name}" AND isrc:*' # we only care about song results that have an existing recording
    if request.artist_name is not None:
        song_query += f' AND artist:"{request.artist_name}"'

    search_result = musicbrainzngs.search_recordings(song_query)

    search_response = []
    for recording in search_result['recording-list']:
        recording_response_item = {}
        recording_response_item['title'] = recording['title']
        recording_response_item['mbid'] = recording['id']
        artist_credit = recording['artist-credit']
        recording_response_item['artist'] = []
        for artist in artist_credit:
            if type(artist) is str: # value of artist is "feat"
                pass
            else:
                print(artist)
                recording_response_item['artist'].append({'name': artist['name'], 'id': artist['artist']['id']})
        recording_response_item['isrc-list'] = recording['isrc-list']
        search_response.append(recording_response_item)

    return search_response
