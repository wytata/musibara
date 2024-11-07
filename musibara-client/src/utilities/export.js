import spotifyClient from "./spotifyClient"

export async function exportPlaylist(isrc_list, name, access_token) {
  spotifyClient.setAccessToken(access_token)

  const res = await spotifyClient.createPlaylist(name)
  let playlist_id = res.body.id

  let track_uri_list = await Promise.all(isrc_list.map(async (isrc) => {
    let res = await spotifyClient.searchTracks(`isrc:${isrc}`)
    let tracks = res.body.tracks
    return tracks.items[0].uri
  }))

  spotifyClient.addTracksToPlaylist(playlist_id, track_uri_list)
} 
