import spotifyClient from "./spotifyClient.js"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export async function getSpotifyPlaylists(access_token) {
  spotifyClient.setAccessToken(access_token)

  /* Minimal function, but we don't need to do much work until a user actually tries to 
   * import a playlist. This function returns a list of playlists, and for each one, we should 
   * include a button allowing the user to import the playlist that will trigger execution 
   * of the importPlaylist() function
  */

  var user_playlists_response =  await spotifyClient.getUserPlaylists()
  const playlist_data = user_playlists_response.body
  return playlist_data.items 
}

export async function importSpotifyPlaylist(playlist_id, playlist_name, access_token, refresh_token) {
  try {
    spotifyClient.setAccessToken(access_token)
    spotifyClient.setRefreshToken(refresh_token)
    var tracks = await spotifyClient.getPlaylistTracks(playlist_id, {})
    var tracks_data = tracks.body.items
    console.log(tracks_data)
    var song_list = tracks_data.map((track) => {
      return {"isrc": track.track.external_ids.isrc, "name": track.track.name}
    })

    const import_response = await importPlaylist(playlist_id, playlist_name, song_list)
    const data = await import_response.json()
    return data
  } catch (err) {
    alert(`Server encountered error while attempting to import playlist: ${err}`)
  }
}

export async function importAppleMusicPlaylist(playlist_id, playlist_name, token) {
  try {
    const playlist_response = await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlist_id}?include=tracks`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APPLE_TOKEN}`,
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
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APPLE_TOKEN}`,
        'Music-User-Token': token 
      }
    })
    if (!songs_response.ok) {
      alert("Failed to get songs for playlist")
      return null
    }
    const songs_data = await songs_response.json()
    const song_list = songs_data.data.map((song) => {
      // TODO - I bet this could be done better
      return song.relationships.catalog ? {"isrc": song.relationships.catalog.data[0].attributes.isrc, "name": song.attributes.name} : null
    })
    const import_response = await importPlaylist(playlist_id, playlist_name, song_list)
    if (!import_response.ok) {
      alert("Failed to import playlist into Musibara")
    }
    const import_data = await import_response.json()
    return import_data
  } catch (err) {
    console.log(err)
  }
}

export async function importPlaylist(playlist_id, playlist_name, song_list) {
  return await fetch(`${apiUrl}/api/playlists/import`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      "song_list": song_list,
      "playlist_name": playlist_name,
      "external_id": playlist_id
    })
  })
}
