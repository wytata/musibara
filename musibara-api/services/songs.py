import musicbrainzngs
from musicbrainzngs.caa import musicbrainz
from config.db import db
from fastapi import Response, Request

from musibaraTypes.songs import SongRequest, SaveSongRequest

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
                recording_response_item['artist'].append({'name': artist['name'], 'id': artist['artist']['id']})
        recording_response_item['isrc-list'] = recording['isrc-list']
        recording_response_item['releases'] = [release['id'] for release in recording['release-list']]
        print("----")
        print(recording['release-list'])
        print("----")
        search_response.append(recording_response_item)

    return search_response

async def saveSong(request: SaveSongRequest):
    response = Response(status_code=201)
    cursor = db.cursor()
    coverarturl = "NULL"
    for release in request.release_list:
        try:
            coverarturl = f"'{musicbrainzngs.get_image_list(release)['images'][0]['image']}'"
            break
        except musicbrainzngs.ResponseError:
            continue

    res = cursor.execute(f"INSERT INTO songs(mbid, isrc, name, coverarturl) VALUES('{request.mbid}', '{request.isrc}', '{request.title}', {coverarturl}) ON CONFLICT (mbid) DO NOTHING")
    if res is not None:
        response.status_code = 500
    else:
        db.commit()

    for artist in request.artist:
        res = cursor.execute(f"INSERT INTO artists(mbid, name) VALUES('{artist['id']}', '{artist['name']}') ON CONFLICT (mbid) DO NOTHING")
        if res is not None:
            response.status_code = 500
        else:
            db.commit()

    return response



