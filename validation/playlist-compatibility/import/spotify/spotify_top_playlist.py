import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import musicbrainzngs
import os
import dotenv

dotenv.load_dotenv()

SPOTIFY_ID=os.getenv("SPOTIFY_ID")
SPOTIFY_SECRET=os.getenv("SPOTIFY_SECRET")

def get_isrcs_of_top_playlist(filename):
    file = open(filename, "a+")
    spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=SPOTIFY_ID, client_secret=SPOTIFY_SECRET))
    offset = 0
    limit = 100
    isrc_list = []
    for _ in range(3): # Playlist has 896 total songs, we just want 300
        # Below playlist ID corresponds to the weekly updated "Spotify's Most Played All-Time..." playlist
        # which can be found at https://open.spotify.com/playlist/2YRe7HRKNRvXdJBp9nXFza
        playlist_items = spotify.playlist_items("2YRe7HRKNRvXdJBp9nXFza", limit=limit, offset=offset)
        limit = (len(playlist_items['items']))
        offset += limit
        items = playlist_items['items']
        for item in items:
            print(item['track']['external_ids']['isrc'], file=file)
    file.close()

get_isrcs_of_top_playlist("spotify_popular_songs.txt")
