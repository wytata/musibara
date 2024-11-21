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
    album_result = musicbrainzngs.get_release_by_id(album.mbid, includes=['recordings', 'isrcs'])
    id = album_result["release"]["id"]
    title = album_result["release"]["title"]
    track_list = album_result["release"]["medium-list"][0]["track-list"]
    recordings = [(release["recording"]["id"], release["recording"]["title"], release["recording"]["isrc-list"][0]) for release in track_list]
    return recordings
    return album_result
    db = get_db_connection()
    cursor = db.cursor()
    insert_artist_query = "INSERT INTO albums (mbid, name) VALUES (%s, %s) ON CONFLICT DO NOTHING"
    cursor.execute(insert_artist_query, (id, title))
    db.commit()
    cursor.close()
    return {"msg": f"Successfully saved album {title} to database."}

