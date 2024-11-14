"use client"

import { useRouter } from 'next/navigation'

export default function LinkSpotifyButton() {
  const router = useRouter()

  const linkSpotify = () => {
    var state = "hello" // TODO - what is the best practice for this variable?

    var authURL = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}&scope=playlist-modify-public%20playlist-modify-private&state=${state}`

    router.push(authURL)
  }

  return (
    <button onClick={linkSpotify}>Link Spotify Account</button>
  )
}
