"use server"

import spotifyClient from "./spotifyClient"
import { redirect } from "next/navigation"

export async function getUserPlaylistsSpotify(access_token, refresh_token) {
    spotifyClient.setClientSecret(process.env.SPOTIFY_SECRET)
    spotifyClient.setAccessToken(access_token)
    spotifyClient.setRefreshToken(refresh_token)
    if (!access_token || !refresh_token) {
        return
    }
    const response = spotifyClient.refreshAccessToken().then(async (data) => {
        spotifyClient.setAccessToken(data.body['access_token'])
        try {
            const playlist_response = await spotifyClient.getUserPlaylists()
            const response = {playlists: playlist_response.body.items, access_token: spotifyClient.getAccessToken()}
            return response
        } catch (e) {
            console.log(e)
        }
    }, (error) => {
            console.error(error)
        })
    return response

}

export async function handleAuthCode(code, state) {
    console.log(`GOT CODE: ${code}`)
    var access_token
    var refresh_token
    const { username } = JSON.parse(decodeURIComponent(state));
    try {
        spotifyClient.setRedirectURI(process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI)
        const res = await spotifyClient.authorizationCodeGrant(code) 
        access_token = res.body.access_token
        refresh_token = res.body.refresh_token
    } catch (e) {
        console.log(e)
    } finally {
        redirect(`/profile/${username}?access_token=${access_token}&refresh_token=${refresh_token}`, 'replace')
    }

}
