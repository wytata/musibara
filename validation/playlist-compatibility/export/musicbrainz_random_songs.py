import musicbrainzngs

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

async def searchSongByName():
    random_queries = []
    random_query_index = None
    song_query = f'' # we only care about song results that have an existing recording
    search_result = musicbrainzngs.search_recordings(song_query, offset=offset)

    search_response = []
    for recording in search_result['recording-list']:
        recording_response_item = {}
        recording_response_item['title'] = recording['title']
        recording_response_item['mbid'] = recording['id']
        artist_credit = recording['artist-credit']
        recording_response_item['artist'] = []
        for artist in artist_credit:
            if type(artist) is str: # value of artist is "feat"
                pass
            else:
                recording_response_item['artist'].append({'name': artist['name'], 'id': artist['artist']['id']})
        recording_response_item['isrc-list'] = recording['isrc-list']
        if 'release-list' in recording.keys():
            recording_response_item['releases'] = [release['id'] for release in recording['release-list']]
        else:
            recording_response_item['releases'] = []
        search_response.append(recording_response_item)

    return {"data": search_response, "count": search_result['recording-count']}
