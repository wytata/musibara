from config.db import get_db_connection
from fastapi import Response, Request

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
