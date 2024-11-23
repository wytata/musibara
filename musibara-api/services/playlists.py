from fastapi.responses import JSONResponse
import psycopg2
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from config.db import get_db_connection
from fastapi import Response, Request, UploadFile, Form, status
from musibaraTypes.playlists import MusibaraPlaylistType, PlaylistImportRequest
from typing_extensions import Annotated
from config.aws import get_bucket_name
from services.users import get_current_user
from .s3bucket_images import get_image_url, upload_image_s3
import json
import asyncio
import musicbrainzngs

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

    return {"playlistid": inserted_id, "name": playlist.name, "description": playlist.description, "image": image_id}


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

async def delete_song_from_playlist(request: Request, playlist_id: int, song_id: Annotated[str, Form()]):
    user = await get_current_user(request)
    if user is None:
        # TODO - update this pending modifications to other playlist code based on whether we can add public/private playlist modification
        pass

    user_id = user['userid']
    db = get_db_connection()
    cursor = db.cursor()
    try:
        # TODO - should user_id matter?
        delete_query = "DELETE FROM playlistsongs WHERE userid = %s AND playlistid = %s AND songid = %s"
        cursor.execute(delete_query, (user_id, playlist_id, song_id,))
        db.commit()
        return JSONResponse(status_code=HTTP_200_OK, content={"msg": f"Successfully deleted song with id {song_id} from playlist {playlist_id}."})
    except psycopg2.errors.ForeignKeyViolation:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Invalid song id provided."}) 

async def get_playlists_by_userid(user_id: int):
    db = get_db_connection()
    cursor = db.cursor()
        
    get_playlists_query = "SELECT * FROM playlists WHERE userid = %s"
    cursor.execute(get_playlists_query, (user_id, ))
    rows = cursor.fetchall()
    if not rows:
        return None
    columnNames = [desc[0] for desc in cursor.description]
    playlists_result = [dict(zip(columnNames, row)) for row in rows]
    for playlist_result in playlists_result:
        songs_query = "SELECT isrc, name FROM playlistsongs JOIN songs ON playlistsongs.songid = songs.mbid WHERE playlistid = %s"
        cursor.execute(songs_query, (playlist_result['playlistid'],))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        songs_result = [dict(zip(columnNames, row)) for row in rows]
        playlist_result["songs"] = songs_result
        
        if playlist_result['imageid'] is not None:
            playlist_result["image_url"] = await get_image_url(playlist_result['imageid'])
        else:
            playlist_result["image_url"] = None

    cursor.close()
    return playlists_result

async def get_user_playlists(request: Request):
    db = get_db_connection()
    cursor = db.cursor()
    user = await get_current_user(request)
    if user is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})
        
    get_playlists_query = "SELECT playlists.playlistid, name, description, imageid, userid, herdid, createdts, externalid, completed FROM playlists LEFT JOIN playlistimports on playlists.playlistid = playlistimports.playlistid WHERE userid = %s"
    cursor.execute(get_playlists_query, (user['userid'], ))
    rows = cursor.fetchall()
    if not rows:
        return None
    columnNames = [desc[0] for desc in cursor.description]
    playlists_result = [dict(zip(columnNames, row)) for row in rows]

    async def get_songs_and_image(playlist_result):
        songs_query = "SELECT isrc, name, songid FROM playlistsongs JOIN songs ON playlistsongs.songid = songs.mbid WHERE playlistid = %s"
        cursor.execute(songs_query, (playlist_result['playlistid'],))
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        songs_result = [dict(zip(columnNames, row)) for row in rows]
        playlist_result["songs"] = songs_result
        
        if playlist_result['imageid'] is not None:
            playlist_result["image_url"] = await get_image_url(playlist_result['imageid'])
        else:
            playlist_result["image_url"] = None
        return playlists_result

    tasks = [get_songs_and_image(playlist_result) for playlist_result in playlists_result]
    result = await asyncio.gather(*tasks)
    return result[0]

async def import_playlist(request: Request, import_request: PlaylistImportRequest):
    user = await get_current_user(request)
    if user is None:
        return JSONResponse(status_code=HTTP_401_UNAUTHORIZED, content={"msg": "You must be authenticated to perform this action."})

    db = get_db_connection()
    cursor = db.cursor()

    create_playlist_query = "INSERT INTO playlists (playlistid, name, description, imageid, userid, herdid) VALUES (default, %s, %s, NULL, %s, NULL) RETURNING playlistid"
    cursor.execute(create_playlist_query, (import_request.playlist_name, "", user['userid']))
    inserted_id = cursor.fetchone()[0]
    
    create_import_query = "INSERT INTO playlistimports (playlistid, externalid, completed) VALUES (%s, %s, FALSE)"
    cursor.execute(create_import_query, (inserted_id, import_request.external_id, ))
    db.commit()

    isrc_list = import_request.isrc_list
    playlist_name = import_request.playlist_name
    mbid_list = []
    for isrc in isrc_list:
        print(f"Resolving isrc {isrc}")
        try:
            recording_list = musicbrainzngs.get_recordings_by_isrc(isrc)['isrc']['recording-list']
            mbid = recording_list[0]['id']
            mbid_list.append(mbid)
            title = recording_list[0]['title']
            insert_query = "INSERT INTO songs (mbid, isrc, name) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING"
            cursor.execute(insert_query, (mbid, isrc, title,))
            db.commit()
        except Exception as e:
            print(e)

    insert_query = "INSERT INTO playlistsongs (userid, playlistid, songid) VALUES "
    values_list = []
    for mbid in mbid_list:
        values_list.append(f"({user['userid']}, {inserted_id}, '{mbid}')")
    insert_query += ", ".join(values_list)
    try:
        cursor.execute(insert_query)
        db.commit()
        update_import_query = "UPDATE playlistimports SET completed = TRUE WHERE playlistid = %s AND externalid = %s"
        cursor.execute(update_import_query, (inserted_id, import_request.external_id, ))
        db.commit()
    except psycopg2.errors.ForeignKeyViolation:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Invalid song id provided."}) 
    except psycopg2.errors.UniqueViolation:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": f"Song with id {song_id} is already in this playlist."})

    cursor.close()

    return JSONResponse(status_code=HTTP_201_CREATED, content={"msg": f"Successfully imported playlist {playlist_name}."})
