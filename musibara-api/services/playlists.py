from fastapi import Request
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import dotenv
import os

dotenv.load_dotenv()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=SPOTIFY_CLIENT_ID,
                                               client_secret=SPOTIFY_CLIENT_SECRET,
                                               redirect_uri='http://localhost:3000',
                                               scope=['user-library-read', 'playlist-modify-public']))

async def get_tracks_by_isrc(isrc: str):
    result = sp.search(q=f'isrc:{isrc}', type='track', limit=1)
    return result['tracks']['items'][0]['id']

async def exportPlaylist(request: Request, isrc_list: list[str], playlist_id):
    # Create playlist from playlist metadata - omitting this until playlist data format is sorted out
    user_id = sp.me()['id'] # may change
    playlist_create_res = sp.user_playlist_create(user_id, "playlistTest")
    playlist_id = playlist_create_res['id']
    
    track_uris = []
    for isrc in isrc_list:
        track_uri = await get_tracks_by_isrc(isrc)
        track_uris.append(track_uri)

    sp.user_playlist_add_tracks(user_id, playlist_id, track_uris)

    return None



