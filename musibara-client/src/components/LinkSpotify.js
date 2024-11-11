"use client"

import SpotifyWebApi from 'spotify-web-api-node'
import { useRouter } from 'next/navigation'


export default function LinkSpotifyButton() {
  const router = useRouter()

  const link = () => {
    var scopes = ['playlist-modify-public', 'playlist-modify-private']
    var state = "hello" // TODO - what is the best practice for this variable?

    var client = new SpotifyWebApi({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_ID,
      clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_SECRET,
      redirectUri: "http://localhost:3000/profile"
    })

    var authURL = `https://accounts.spotify.com/authorize?client_id=${client.getClientId()}&response_type=token&redirect_uri=${client.getRedirectURI()}&scope=playlist-modify-public%20playlist-modify-private&state=${state}`
    router.push(authURL)
  }

  return (
    <button onClick={link}>Link Spotify Account</button>
  )
}
