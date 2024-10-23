import musicbrainzngs
import asyncio

musicbrainzngs.set_useragent(
        "python-musicbrainzngs-example",
        "0.1",
        "https://fakeurl.com"
)

print(musicbrainzngs.search_works("not like us"))

