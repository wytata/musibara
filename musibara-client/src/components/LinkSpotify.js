"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LinkSpotifyButton() {
  const router = useRouter()

  const linkSpotify = () => {
    var state = "hello" // TODO - what is the best practice for this variable?

    var authURL = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}&scope=playlist-modify-public%20playlist-modify-private&state=${state}`

    router.push(authURL)
  }

  return (
    <button onClick={linkSpotify} type="button" class="text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center w-1/3 dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 me-2 mb-2">
      <Image className='mr-5' src='https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg' width={30} height={30}/>
        Connect Spotify Account
    </button>
  )
}
