import spotifyClient from "./spotifyClient"

export async function exportPlaylistSpotify(isrc_list, name, access_token, refresh_token) {
  spotifyClient.setAccessToken(access_token)
  spotifyClient.setRefreshToken(refresh_token)

  try {
    const res = await spotifyClient.createPlaylist(name)
    let playlist_id = res.body.id

    let track_uri_list = await Promise.all(isrc_list.map(async (isrc) => {
      let res = await spotifyClient.searchTracks(`isrc:${isrc}`)
      let tracks = res.body.tracks
      if (tracks.items && tracks.items[0]) {
        return tracks.items[0].uri
      }
      //return tracks.items[0] ? tracks.items[0].uri : null
    }))
    console.log(track_uri_list)

    spotifyClient.addTracksToPlaylist(playlist_id, track_uri_list.filter(t => t))
  } catch (err) {
    alert(err)
  }
  alert(`Successfully exported playlist ${name} to Spotify.`)
} 

export async function exportPlaylistApple(isrc_list, name, description, token) {
  try {
    const create_playlist_response = await fetch("https://api.music.apple.com/v1/me/library/playlists", {
      method: "POST",
      headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APPLE_TOKEN}`,
          'Music-User-Token': token 
      }, 
      body: JSON.stringify({
        "attributes": {
          "name": name,
          "description": description
        }
      })
    }) 
    const res = await create_playlist_response.json()
    if (!create_playlist_response.ok) {
      alert(res.message ? res.message : "Could not export playlist")
    }
    const playlist_id = res.data[0].id
    console.log(playlist_id)

    const slice_groups = isrc_list.length / 25
    for (let i = 0; i < slice_groups; i++) {
      let isrcs = isrc_list.slice(25*i,25*(i+1))
      const isrc_request = await fetch(`https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${isrcs.join(",")}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APPLE_TOKEN}`,
          'Music-User-Token': token 
        }
      })
      if (!isrc_request.ok) {
        alert("Could not add songs to new playlist")
        return null
      }
      const data = await isrc_request.json()
      var song_list = []
      console.log(data)
      for (const item in data.meta.filters.isrc) {
        data.meta.filters.isrc[item][0] && song_list.push(data.meta.filters.isrc[item][0])
      };
      console.log(song_list)
      const add_songs_response = await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlist_id}/tracks`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APPLE_TOKEN}`,
          'Music-User-Token': token 
        },
        body: JSON.stringify({
          "data": song_list
        })
      })
      if (!add_songs_response.ok) {
        alert("Failed to add songs to new playlist")
        return null
      }
    }
  } catch (err) {
    alert(`Failed to export playlist to Apple Music. Error: ${err}`)
    return
  }
  alert(`Successfully exported playlist ${name} to Apple Music.`)
}




