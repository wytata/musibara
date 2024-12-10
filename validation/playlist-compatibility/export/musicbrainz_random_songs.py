import musicbrainzngs
import random

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

def getRandomISRC(output_file):
    try:
        random_alpha = chr(97 + random.randint(0,25))
        song_query = f'{random_alpha} AND isrc:*'
        search_result = musicbrainzngs.search_recordings(song_query)
        recording_count = search_result['recording-count']
        search_result_with_offset = musicbrainzngs.search_recordings(song_query, offset=random.randint(0,recording_count))
        recording = search_result_with_offset['recording-list'][0]
        isrc_list = recording['isrc-list']
        if len(isrc_list) > 1:
            print(", ".join(isrc_list), file=output_file)
        else:
            print(isrc_list[0], file=output_file)
    except Exception as e:
        print(e)
    

file = open("musicbrainz-random-songs.txt", "a+")
for _ in range(200):
    getRandomISRC(file)
file.close()


