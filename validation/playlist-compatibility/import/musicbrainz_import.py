import musicbrainzngs
import random

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

def resolve_isrcs(filename):
    file = open(filename, "r+")
    for line in file:
        isrc = line.strip("\n") 
    file.close()

resolve_isrcs("spotify/spotify_popular_songs.txt")
#resolve_isrcs("apple-music/apple_music_popular.txt")

