import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import musicbrainzngs
import os
import dotenv

dotenv.load_dotenv()

SPOTIFY_ID=os.getenv("SPOTIFY_ID")
SPOTIFY_SECRET=os.getenv("SPOTIFY_SECRET")

def mb_resolve_isrc(isrc_list, file):
    for isrc in isrc_list:
        try:
            recording = musicbrainzngs.get_recordings_by_isrc(isrc)
            file.write(f"{recording['isrc']['recording-list'][0]['id']}, {isrc}, {recording['isrc']['recording-list'][0]['title']}\n")
        except Exception as e:
            continue

def create_songs():
    #musicbrainzngs.set_useragent(
    #    "python-musicbrainzngs-example",
    #    "0.1",
    #    "https://fakeurl.com"
    #)
    spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=SPOTIFY_ID, client_secret=SPOTIFY_SECRET))
    offset = 0
    limit = 100
    isrc_list = []
    for i in range(3): # Playlist has 896 total songs, we just want 300
        # Below playlist ID corresponds to the weekly updated "Spotify's Most Played All-Time..." playlist
        # which can be found at https://open.spotify.com/playlist/2YRe7HRKNRvXdJBp9nXFza
        playlist_items = spotify.playlist_items("2YRe7HRKNRvXdJBp9nXFza", limit=limit, offset=offset)
        limit = (len(playlist_items['items']))
        offset += limit
        items = playlist_items['items']
        for item in items:
            isrc_list.append(item['track']['external_ids']['isrc'])
    print(isrc_list)
    print(len(isrc_list))

create_songs()
