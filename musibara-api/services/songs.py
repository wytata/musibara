import musicbrainzngs
from musicbrainzngs.caa import musicbrainz
from config.db import get_db_connection
from fastapi import Response, Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_400_BAD_REQUEST

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

    if request.page_num <= 0:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Page number should be 1 or greater."})
    offset = 1 if request.page_num is None else (request.page_num-1) * 25
    search_result = musicbrainzngs.search_recordings(song_query, offset=offset)

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
        search_response.append(recording_response_item)

    return {"data": search_response, "count": search_result['recording-count']}

async def saveSong(request: SaveSongRequest):
    response = Response(status_code=201)
    db = get_db_connection()
    cursor = db.cursor()

    for release in request.release_list:
        try:
            coverarturl = f"'{musicbrainzngs.get_image_list(release)['images'][0]['image']}'"
            print(coverarturl)
            break
        except musicbrainzngs.ResponseError:
            continue

    res = cursor.execute(f"INSERT INTO songs(mbid, isrc, name, imageid) VALUES('{request.mbid}', '{request.isrc}', '{request.title}', NULL) ON CONFLICT (mbid) DO NOTHING")

    if res is not None:
        response.status_code = 500
        return response

    for artist in request.artist:
        res = cursor.execute(f"INSERT INTO artists(mbid, name) VALUES(%s, %s) ON CONFLICT (mbid) DO NOTHING", (artist['id'], artist['name'], ))
        if res is not None:
            response.status_code = 500
            return response

    song_artist_entries = [(artist['id'], request.mbid) for artist in request.artist]
    values_list = ','.join(cursor.mogrify(f"(%s, %s)", entry).decode('utf-8') for entry in song_artist_entries)
    res = cursor.execute("INSERT INTO artistsongs (artistid, songid) VALUES " + values_list + " ON CONFLICT DO NOTHING")
    if res is not None:
        response.status_code = 500
        return response

    db.commit()
    return response
