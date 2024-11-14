"use server"

import spotifyClient from "./spotifyClient"
import { redirect } from "next/navigation"

export async function getUserPlaylists(access_token, refresh_token) {
    spotifyClient.setAccessToken(access_token)
    spotifyClient.setRefreshToken(refresh_token)
    spotifyClient.refreshAccessToken()

    try {
        const playlist_response = await spotifyClient.getUserPlaylists()
        console.log(playlist_response.body)
        return playlist_response.body.items
    } catch (e) {
        console.log(e)
    }
}

export async function handleAuthCode(code) {
    //console.log(spotifyClient.getRedirectURI())
    var access_token
    var refresh_token
    try {
        const res = await spotifyClient.authorizationCodeGrant(code) 
        access_token = res.body.access_token
        refresh_token = res.body.refresh_token
    } catch (e) {
        console.log(e)
    } 

    // TODO - This may work just fine but I have a feeling there is a much better way to handle this
    redirect(`/profile?access_token=${access_token}&refresh_token=${refresh_token}`, 'replace')
}
