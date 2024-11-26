"use server"

export async function getUserPlaylistsApple(token) {
    try {
        const response = await fetch("https://api.music.apple.com/v1/me/library/playlists", {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APPLE_TOKEN}`,
                'Music-User-Token': token 
            }
        })
        if (response.ok) {
            const data = await response.json()
            return data.data
        }
    } catch (err) {
        console.log(err)
    }
}
