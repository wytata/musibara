import musicbrainzngs

musicbrainzngs.set_useragent(
        "python-musicbrainzngs-example",
        "0.1",
        "https://fakeurl.com"
)

search_result = musicbrainzngs.search_recordings("\"not like us\" AND isrc:*")
print(search_result['recording-list'])
