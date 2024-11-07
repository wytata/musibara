import SpotifyWebApi from "spotify-web-api-node";

const spotifyClient = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_ID,
  clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_SECRET,
  redirectUri: "http://localhost:3000"
})

export default spotifyClient
