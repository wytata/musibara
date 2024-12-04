import musicbrainzngs
import random

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

def resolve_isrcs(filename, output_name):
    file = open(filename, "r+")
    output_file = open(output_name, "a+")
    file.write("isrc, num-recordings")

    for line in file:
        isrc = line.strip("\n")
        try:
            recording_list = musicbrainzngs.get_recordings_by_isrc(isrc)['isrc']['recording-list']
            num_results = len(recording_list)
            print(f"{isrc}, {num_results}", file=output_file)
        except Exception as e:
            print(f"{isrc}, 0", file=output_file)

    file.close()
    output_file.close()

resolve_isrcs("spotify/spotify_popular_songs.txt", "spotify-import-results.csv")
resolve_isrcs("apple-music/apple_music_popular.txt", "apple-music-import-results.csv")

