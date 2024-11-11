from typing import Annotated
import musicbrainzngs
from config.db import get_db_connection
from fastapi import Response, Request, Form
from musibaraTypes.artists import Artist


musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

async def search_artist_by_name(artist_name: Annotated[str, Form()]):
    # in quotes helps filter results on mb
    search_result = musicbrainzngs.search_artists(f'"{artist_name}"')
    artist_list = search_result['artist-list']
    response = {}
    response['artist-list'] = artist_list
    return response

async def save_artist(artist: Artist):
    db = get_db_connection()
    cursor = db.cursor()
    insert_artist_query = "INSERT INTO artists (mbid, name) VALUES (%s, %s) ON CONFLICT DO NOTHING"
    cursor.execute(insert_artist_query, (artist.mbid, artist.name))
    db.commit()
    cursor.close()
    return {"msg": f"Successfully saved artist {artist.name} to database."}



