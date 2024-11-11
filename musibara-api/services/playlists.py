from fastapi.responses import JSONResponse
import psycopg2
from starlette.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from config.db import get_db_connection
from fastapi import Response, Request, UploadFile, Form, status
from musibaraTypes.playlists import MusibaraPlaylistType
from typing_extensions import Annotated
from config.aws import get_bucket_name
from services.users import get_current_user
from .s3bucket_images import get_image_url, upload_image_s3
import json

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
    
    if playlist_result['imageid'] is not None:
        playlist_result["image_url"] = await get_image_url(playlist_result['imageid'])
    else:
        playlist_result["image_url"] = None

    cursor.close()

    return playlist_result

async def create_playlist(request: Request, playlist: MusibaraPlaylistType, file: UploadFile):
    user = await get_current_user(request)
    if user is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})

    db = get_db_connection()
    cursor = db.cursor()

    image_id = None
    if file is not None:
        file_name = str(file.filename)
        bucket_name = get_bucket_name()
        image_id = await upload_image_s3(file, bucket_name, file_name)

    create_playlist_query = ""
    if playlist.herd_id is None:
        create_playlist_query = "INSERT INTO playlists (playlistid, name, description, imageid, userid, herdid) VALUES (default, %s, %s, %s, %s, NULL) RETURNING playlistid"
        cursor.execute(create_playlist_query, (playlist.name, playlist.description, image_id, user['userid']))
    else:
        create_playlist_query = "INSERT INTO playlists (playlistid, name, description, imageid, userid, herdid) VALUES (default, %s, %s, %s, %s, %s) RETURNING playlistid"
        cursor.execute(create_playlist_query, (playlist.name, playlist.description, image_id, user['userid'], playlist.herd_id))

    inserted_id = cursor.fetchone()[0]
    db.commit()
    cursor.close()

    return JSONResponse(status_code=HTTP_201_CREATED, content={"msg": "Successfully created playlist", "playlist_id": inserted_id})


async def delete_playlist_by_id(request: Request, playlist_id: int):
    user = await get_current_user(request)
    if user is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})
    
    delete_playlist_query = "DELETE FROM playlists WHERE playlistid = %s AND userid = %s RETURNING *"
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(delete_playlist_query, (playlist_id, user['userid']))
    db.commit()
    if cursor.fetchone() is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": f"Could not delete playlist {playlist_id}. Make sure that you are the playlist owner and that the playlist exists."})
    else:
        return JSONResponse(status_code=HTTP_204_NO_CONTENT, content={"msg": f"Successfully deleted playlist {playlist_id}"})

async def add_song_to_playlist(request: Request, playlist_id: int, song_id: Annotated[str, Form()]):
    user = await get_current_user(request)
    if user is None:
        # TODO - update this pending modifications to other playlist code based on whether we can add public/private playlist modification
        pass
    user_id = user['userid']
    db = get_db_connection()
    cursor = db.cursor()
    try:
        insert_query = "INSERT INTO playlistsongs (userid, playlistid, songid) VALUES (%s, %s, %s) RETURNING *"
        cursor.execute(insert_query, (user_id, playlist_id, song_id,))
        db.commit()
        return JSONResponse(status_code=HTTP_201_CREATED, content={"msg": f"Successfully added song with id {song_id} to playlist {playlist_id}."})
    except psycopg2.errors.ForeignKeyViolation:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Invalid song id provided."}) 
    except psycopg2.errors.UniqueViolation:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": f"Song with id {song_id} is already in this playlist."})


