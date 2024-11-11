import musicbrainzngs
from config.db import get_db_connection
from fastapi import Response, Request, Form
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
    db = get_db_connection()
    cursor = db.cursor()
    insert_artist_query = "INSERT INTO albums (mbid, name) VALUES (%s, %s) ON CONFLICT DO NOTHING"
    cursor.execute(insert_artist_query, (album.mbid, album.name))
    db.commit()
    cursor.close()
    return {"msg": f"Successfully saved album {album.name} to database."}

