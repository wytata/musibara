from fastapi.responses import JSONResponse
from starlette.status import HTTP_401_UNAUTHORIZED
from config.db import get_db_connection
from fastapi import Response, Request, UploadFile
from musibaraTypes.playlists import MusibaraPlaylistType
from config.aws import get_bucket_name
from .s3bucket_images import upload_image_s3
from .user_auth import get_username_from_cookie

async def get_playlist_by_id(playlist_id: int):
    db = get_db_connection()
    cursor = db.cursor()

    playlist_query = "SELECT * FROM playlists WHERE playlistid = %s"
    cursor.execute(playlist_query, (playlist_id,))
    rows = cursor.fetchone()
    columnNames = [desc[0] for desc in cursor.description]
    playlist_result = dict(zip(columnNames, rows))

    songs_query = "SELECT isrc, name FROM playlistsongs JOIN songs ON playlistsongs.songid = songs.mbid WHERE playlistid = %s"
    cursor.execute(songs_query, (playlist_id,))
    rows = cursor.fetchall()
    columnNames = [desc[0] for desc in cursor.description]
    songs_result = [dict(zip(columnNames, row)) for row in rows]
    playlist_result["songs"] = songs_result

    return playlist_result

async def create_playlist(request: Request, playlist: MusibaraPlaylistType, file: UploadFile):
    db = get_db_connection()
    cursor = db.cursor()

    username = get_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})

    file_name = str(file.filename)
    print(file_name)
    bucket_name = get_bucket_name()
    await upload_image_s3(file, bucket_name, file_name)


    #create_playlist_query = "INSERT INTO playlists (playlistid, name, description, imageid, userid, herdid) VALUES (default, %s, %s, %s, %s, %s)"
    #cursor.execute(create_playlist_query, (playlist.name, playlist.description, playlist.image_id, playlist.))
