import fs from 'fs'

const fetch_playlist = async () => {
	try {
		const playlist_response = await fetch(`https://api.music.apple.com/v1/catalog/us/playlists/pl.8ba78a4a65cc4530bcfdfc5154385c29?include=tracks`, {
			headers: {
				'Authorization': `Bearer ${process.env.APPLE_TOKEN}`
			}
		})
		if (!playlist_response.ok) {
			return null
		}
		const data = await playlist_response.json()
		const tracks = data.data[0].relationships.tracks.data
		const isrc_list = tracks.map((track) => {return track.attributes?.isrc})
		return isrc_list
	} catch (err) {
		console.log(err)
	}
}

const isrc_list = await fetch_playlist()
fs.writeFile('apple_music_popular.txt', isrc_list.join("\n"), (err) => {
	if (err) {
		console.error(err)
	} else {
		console.log("Successfully wrote isrcs to apple_music_popular.txt")
	}
})
