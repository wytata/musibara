"use server"

export async function getUserPlaylistsApple(token) {
    try {
        const response = await fetch("https://api.music.apple.com/v1/me/library/playlists", {
            headers: {
                'Authorization': `Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IlJRNkJUMzJIWDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiI3RlE0NEc3QTNXIiwiaWF0IjoxNzMxNzkwODQzLCJleHAiOjE3NDc1Njc4NDJ9.H9hAKuITzdNEKQ7b0Mjk8mruJwg--IcEEUp8i4OE4j9qp4Nr2EZOwMHN5Yibn0EzT4ixLthVBRNC-MK-U28DoA`,
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
