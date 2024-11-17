import spotifyClient from "./spotifyClient.js"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export async function getSpotifyPlaylists(access_token) {
  spotifyClient.setAccessToken(access_token)

  /* Minimal function, but we don't need to do much work until a user actually tries to 
   * import a playlist. This function returns a list of playlists, and for each one, we should 
   * include a button allowing the user to import the playlist that will trigger execution 
   * of the importPlaylist() function
  */

  var user_playlists_repsonse =  await spotifyClient.getUserPlaylists()
  const playlist_data = user_playlists_repsonse.body
  return playlist_data.items 
}

export async function importSpotifyPlaylist(playlist_id, playlist_name, access_token, refresh_token) {
  spotifyClient.setAccessToken(access_token)
  spotifyClient.setRefreshToken(refresh_token)
  var tracks = await spotifyClient.getPlaylistTracks(playlist_id, {})
  var tracks_data = tracks.body.items
  var isrc_list = tracks_data.map((track) => {
    return track.track.external_ids.isrc
  })

  const import_response = await importPlaylist(playlist_name, isrc_list)
  console.log(import_response) // TODO - more robust handling of response (error code, etc.)
}

export async function importAppleMusicPlaylist(playlist_id, playlist_name, token) {
  try {
    const playlist_response = await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlist_id}?include=tracks`, {
      headers: {
        'Authorization': `Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IlJRNkJUMzJIWDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiI3RlE0NEc3QTNXIiwiaWF0IjoxNzMxNzkwODQzLCJleHAiOjE3NDc1Njc4NDJ9.H9hAKuITzdNEKQ7b0Mjk8mruJwg--IcEEUp8i4OE4j9qp4Nr2EZOwMHN5Yibn0EzT4ixLthVBRNC-MK-U28DoA`,
        'Music-User-Token': token 
      }
    })
    if (!playlist_response.ok) {
      alert("Failed to import playlist")
      return null
    }
    const data = await playlist_response.json()
    const tracks = data.data[0].relationships.tracks.data
    const track_ids = tracks.map((track) => {return track.id})
    const songs_response = await fetch(`https://api.music.apple.com/v1/me/library/songs?ids=${track_ids.join(",")}&include=catalog&extend=isrc`, {
      headers: {
        'Authorization': `Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IlJRNkJUMzJIWDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiI3RlE0NEc3QTNXIiwiaWF0IjoxNzMxNzkwODQzLCJleHAiOjE3NDc1Njc4NDJ9.H9hAKuITzdNEKQ7b0Mjk8mruJwg--IcEEUp8i4OE4j9qp4Nr2EZOwMHN5Yibn0EzT4ixLthVBRNC-MK-U28DoA`,
        'Music-User-Token': token 
      }
    })
    if (!songs_response.ok) {
      alert("Failed to get songs for playlist")
      return null
    }
    const songs_data = await songs_response.json()
    const isrc_list = songs_data.data.map((song) => {
      // TODO - I bet this could be done better
      return song.relationships.catalog ? song.relationships.catalog.data[0].attributes.isrc : null
    })
    const import_response = await importPlaylist(playlist_name, isrc_list)
    if (!import_response.ok) {
      alert("Failed to import playlist into Musibara")
    }
  } catch (err) {
    console.log(err)
  }
}

export async function importPlaylist(playlist_name, isrc_list) {
  return await fetch(`${apiUrl}/api/playlists/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      "isrc_list": isrc_list,
      "playlist_name": playlist_name
    })
  })
}
