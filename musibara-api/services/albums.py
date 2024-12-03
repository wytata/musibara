import musicbrainzngs
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from config.db import get_db_connection, release_db_connection
from fastapi import Response, Request, Form, status
from fastapi.responses import JSONResponse
from musibaraTypes.albums import AlbumSearch, Album

async def search_album_by_name(album_search: AlbumSearch):
    # in quotes helps filter results on mb
    search_query = f'"{album_search.album_name}" AND type:Album'
    if album_search.artist_name:
        search_query += f' AND artist:{album_search.artist_name}'

    if album_search.page_num <= 0:
        return JSONResponse(status_code=HTTP_400_BAD_REQUEST, content={"msg": "Page number should be 1 or greater."})
    offset = 1 if album_search.page_num is None else (album_search.page_num-1) * 25

    search_result = musicbrainzngs.search_release_groups(search_query, offset=offset)
    print(search_result.keys())
    response = {"albums": search_result['release-group-list'], "count": search_result["release-group-count"]}
    return response

async def save_album(album: Album):
    album_result = musicbrainzngs.get_release_by_id(album.mbid, includes=['recordings', 'isrcs', 'artists', 'artist-rels'])
    print(album_result)
    artists = album_result["release"]["artist-credit"]
    id = album_result["release"]["id"]
    title = album_result["release"]["title"]
    track_list = album_result["release"]["medium-list"][0]["track-list"]
    recordings = [(release["recording"]["id"], release["recording"]["title"], release["recording"]["isrc-list"][0]) for release in track_list if "isrc-list" in release["recording"].keys()]

    
    db, cursor = None, None
    try:
        db = get_db_connection()
        cursor = db.cursor()
        artist_values = ",".join(cursor.mogrify("(%s, %s)", (artist["artist"]["id"], artist["artist"]["name"])).decode("utf-8") for artist in artists)
        insert_artist_query = f"INSERT INTO artists (mbid, name) VALUES {artist_values} ON CONFLICT DO NOTHING"
        cursor.execute(insert_artist_query)

        album_insert = "INSERT INTO albums (mbid, name) VALUES (%s, %s) ON CONFLICT DO NOTHING"
        cursor.execute(album_insert, (id, title,))

        song_values = ",".join(cursor.mogrify("(%s, %s, %s, NULL)", (recording)).decode("utf-8") for recording in recordings)
        insert_songs_query = f"INSERT INTO songs (mbid, name, isrc, imageid) VALUES {song_values} ON CONFLICT DO NOTHING"
        cursor.execute(insert_songs_query)
         
        artist_album_values = ",".join(cursor.mogrify("(%s, %s)", (artist["artist"]["id"], id)).decode("utf-8") for artist in artists)
        insert_artist_album_query = f"INSERT INTO artistalbums (artistid, albumid) VALUES {artist_album_values} ON CONFLICT DO NOTHING"
        cursor.execute(insert_artist_album_query)

        artist_songs = []
        for artist in artists:
            for release in track_list:
                if "isrc-list" in release["recording"].keys():
                    artist_songs.append((artist["artist"]["id"], release["recording"]["id"]))
        artist_song_values = ",".join(cursor.mogrify("(%s, %s)", value).decode("utf-8") for value in artist_songs)
        insert_artist_songs_query = f"INSERT INTO artistsongs (artistid, songid) VALUES {artist_song_values} ON CONFLICT DO NOTHING"
        cursor.execute(insert_artist_songs_query)

        song_album_values = ",".join(cursor.mogrify("(%s, %s)", (id, release["recording"]["id"])).decode("utf-8") for release in track_list if "isrc-list" in release["recording"].keys())
        insert_song_album_query = f"INSERT INTO albumsongs (albumid, songid) VALUES {song_album_values} ON CONFLICT DO NOTHING"
        cursor.execute(insert_song_album_query)

    except Exception as e:
        print(e)
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"msg": "Server failed to process your request."})
        
    finally:
        if cursor:
            cursor.close()
        if db:
            release_db_connection(db)

    return {"msg": f"Successfully saved album {title} to database."}

