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

export async function importSpotifyPlaylist(playlist_id, playlist_name) {
  var tracks = await spotifyClient.getPlaylistTracks(playlist_id, {})
  var tracks_data = tracks.body.items
  var isrc_list = tracks_data.map((track) => {
    return track.track.external_ids.isrc
  })
  
  const import_response = await importPlaylist(playlist_name, isrc_list)
  console.log(import_response) // TODO - more robust handling of response (error code, etc.)
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
