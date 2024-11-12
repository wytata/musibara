"use client"

import SpotifyWebApi from 'spotify-web-api-node'
import { useRouter } from 'next/navigation'
import spotifyClient from '@/utilities/spotifyClient'


export default function LinkSpotifyButton() {
  const router = useRouter()

  const link = () => {
    var scopes = ['playlist-modify-public', 'playlist-modify-private']
    var state = "hello" // TODO - what is the best practice for this variable?

    var authURL = `https://accounts.spotify.com/authorize?client_id=${spotifyClient.getClientId()}&response_type=code&redirect_uri=${spotifyClient.getRedirectURI()}&scope=playlist-modify-public%20playlist-modify-private&state=${state}`
    router.push(authURL)
  }

  return (
    <button onClick={link}>Link Spotify Account</button>
  )
}
