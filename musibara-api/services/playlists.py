from fastapi.responses import JSONResponse
from starlette.status import HTTP_201_CREATED, HTTP_401_UNAUTHORIZED
from config.db import get_db_connection
from fastapi import Response, Request, UploadFile
from musibaraTypes.playlists import MusibaraPlaylistType
from config.aws import get_bucket_name
from services.users import get_current_user
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

    cursor.close()

    return playlist_result

async def create_playlist(request: Request, playlist: MusibaraPlaylistType, file: UploadFile):
    user = await get_current_user(request)
    print(user)
    if user is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})

    db = get_db_connection()
    cursor = db.cursor()

    image_id = None
    if file is not None:
        # TODO - this part cant be finished until all of the s3 code is done
        file_name = str(file.filename)
        print(file_name)
        bucket_name = get_bucket_name()
        await upload_image_s3(file, bucket_name, file_name)

    create_playlist_query = ""
    if playlist.herd_id is None:
        create_playlist_query = "INSERT INTO playlists (playlistid, name, description, imageid, userid, herdid) VALUES (default, %s, %s, %s, %s, NULL) RETURNING playlistid"
        cursor.execute(create_playlist_query, (playlist.name, playlist.description, image_id, playlist.user_id))
    else:
        create_playlist_query = "INSERT INTO playlists (playlistid, name, description, imageid, userid, herdid) VALUES (default, %s, %s, %s, %s, %s) RETURNING playlistid"
        cursor.execute(create_playlist_query, (playlist.name, playlist.description, image_id, playlist.user_id, playlist.herd_id))

    inserted_id = cursor.fetchone()[0]
    print(inserted_id)
    db.commit()
    cursor.close()

    return JSONResponse(status_code=HTTP_201_CREATED, content={"msg": "Successfully created playlist", "playlist_id": inserted_id})


async def delete_playlist(request: Request, playlist_id: int):
    username = get_username_from_cookie(request)
    if username is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})
    
    
    
