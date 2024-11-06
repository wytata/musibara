import SpotifyWebApi from 'spotify-web-api-node'

export async function exportPlaylist(isrc_list, name, access_token) {
  const client = new SpotifyWebApi({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_ID,
    clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_SECRET,
    redirectUri: "http://localhost:3000"
  })

  client.setAccessToken(access_token)

  const res = await client.createPlaylist(name)
  let playlist_id = res.body.id

  let track_uri_list = await Promise.all(isrc_list.map(async (isrc) => {
    let res = await client.searchTracks(`isrc:${isrc}`)
    let tracks = res.body.tracks
    return tracks.items[0].uri
  }))

  client.addTracksToPlaylist(playlist_id, track_uri_list)
} 
