import musicbrainzngs
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from config.db import get_db_connection
from fastapi import Response, Request, Form, status
from fastapi.responses import JSONResponse
from musibaraTypes.albums import AlbumSearch, Album

async def search_album_by_name(album_search: AlbumSearch):
    # in quotes helps filter results on mb
    search_query = f'"{album_search.album_name}"'
    if album_search.artist_name:
        search_query += f' AND artist:{album_search.artist_name}'

    search_result = musicbrainzngs.search_release_groups(search_query)
    response = {"albums": search_result['release-group-list']}
    return response

async def save_album(album: Album):
    album_result = musicbrainzngs.get_release_by_id(album.mbid, includes=['recordings', 'isrcs', 'artists', 'artist-rels'])
    artists = album_result["release"]["artist-credit"]
    id = album_result["release"]["id"]
    title = album_result["release"]["title"]
    track_list = album_result["release"]["medium-list"][0]["track-list"]
    recordings = [(release["recording"]["id"], release["recording"]["title"], release["recording"]["isrc-list"][0]) for release in track_list]

    db = get_db_connection()
    cursor = db.cursor()
    
    try:
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
                artist_songs.append((artist["artist"]["id"], release["recording"]["id"]))
        artist_song_values = ",".join(cursor.mogrify("(%s, %s)", value).decode("utf-8") for value in artist_songs)
        insert_artist_songs_query = f"INSERT INTO artistsongs (artistid, songid) VALUES {artist_song_values} ON CONFLICT DO NOTHING"
        cursor.execute(insert_artist_songs_query)

        song_album_values = ",".join(cursor.mogrify("(%s, %s)", (id, release["recording"]["id"])).decode("utf-8") for release in track_list)
        insert_song_album_query = f"INSERT INTO albumsongs (albumid, songid) VALUES {song_album_values} ON CONFLICT DO NOTHING"
        cursor.execute(insert_song_album_query)

    except Exception as e:
        cursor.close()
        print(e)
        return JSONResponse(status_code=HTTP_500_INTERNAL_SERVER_ERROR, content={"msg": "Server failed to process your request."})

    db.commit()
    cursor.close()
    return {"msg": f"Successfully saved album {title} to database."}

