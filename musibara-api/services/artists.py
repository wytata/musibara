from typing import Annotated
import musicbrainzngs
from config.db import get_db_connection
from fastapi import Response, Request, Form
from musibaraTypes.artists import Artist, ArtistSearch

async def search_artist_by_name(artist_search: ArtistSearch):
    # in quotes helps filter results on mb
    offset = 0 if artist_search.page_num is None else artist_search.page_num * 25
    search_result = musicbrainzngs.search_artists(f'"{artist_search.artist_name}"', offset=offset)
    artist_list = search_result['artist-list']
    response = {"artist-list": artist_list, "count": search_result["artist-count"]}
    return response

async def save_artist(artist: Artist):
    db = get_db_connection()
    cursor = db.cursor()
    insert_artist_query = "INSERT INTO artists (mbid, name) VALUES (%s, %s) ON CONFLICT DO NOTHING"
    cursor.execute(insert_artist_query, (artist.mbid, artist.name))
    db.commit()
    cursor.close()
    return {"msg": f"Successfully saved artist {artist.name} to database."}
