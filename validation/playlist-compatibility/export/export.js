import SpotifyWebApi from "spotify-web-api-node";
import fs from 'fs'

const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
})

async function exportPlaylistSpotify(isrc_list, name, access_token, refresh_token) {
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
    }))
    console.log(track_uri_list)

    spotifyClient.addTracksToPlaylist(playlist_id, track_uri_list.filter(t => t))
  } catch (err) {
    alert(err)
  }
  alert(`Successfully exported playlist ${name} to Spotify.`)
} 

async function exportPlaylistApple() {
  fs.open('apple-export-results.csv', 'w', (err, fd) => {
    if (err) {
      console.error(err)
      return
    }
    fs.write(fd, "recording-isrc-count, resolved-songs-count, isrc(s)\n", (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
    fs.readFile('musicbrainz-random-songs.txt', 'utf-8', async (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      const entries = data.split("\n")
      const split_entries = entries.map((entry) => entry.split(", "))
      const single_isrc_entries = split_entries.filter((entry) => entry.length == 1)
      const multi_isrc_entries = split_entries.filter((entry) => entry.length > 1)
      const slice_groups = single_isrc_entries.length / 25
      for (let i = 0; i < slice_groups; i++) {
        let isrcs = single_isrc_entries.slice(25*i,25*(i+1))
        try {
          const isrc_request = await fetch(`https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${isrcs.join(",")}`, {
            headers: {
              'Authorization': `Bearer ${process.env.APPLE_TOKEN}`,
            }
          })
          if (!isrc_request.ok) {
            const data = await isrc_request.json()
            console.log(data)
          }
          const data = await isrc_request.json()
          const results = data.meta.filters.isrc
          Object.keys(results).map((isrc) => {
            const file_output = `1, ${results[isrc].length.toString()}, ${isrc}\n`
            fs.write(fd, file_output, (err) => {
              if (err) {
                console.error(err)
                return
              }
            })
          })
        } catch (err) {
          console.error(err)
          return
        }
      }
      for (let i = 0; i < multi_isrc_entries.length; i++) {
        try {
          const isrc_request = await fetch(`https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${multi_isrc_entries[i].join(",")}`, {
            headers: {
              'Authorization': `Bearer ${process.env.APPLE_TOKEN}`,
            }
          })
          if (!isrc_request.ok) {
            data = await isrc_request.json()
            console.log(data)
          }
          data = await isrc_request.json()
          const results = data.meta.filters.isrc
          const total_resolved = Object.keys(results).reduce((acc, obj) => {
            return acc + obj.length
          }, 0)
          const file_output = `${multi_isrc_entries[i].length}, ${total_resolved.toString()}, ${multi_isrc_entries[i].join(" ")}\n`
          fs.write(fd, file_output, (err) => {
            if (err) {
              console.error(err)
              return
            }
          })
        } catch (err) {
          console.error(err)
          return
        }
      }
    })
  })
}

await exportPlaylistApple()


