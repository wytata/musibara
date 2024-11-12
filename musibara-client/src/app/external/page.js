"use server"
import { headers } from "next/headers";
import spotifyClient from "@/utilities/spotifyClient";

export default async function ExternalPlatformPage() {
  console.log(headers().forEach(header => console.log(header)))
  //if (hash) {
  //  const access_token = hash.replace("#","").split("&")[0].split("=")[1] // Should always be access token but this code needs to be more robust
  //  const setTokenResponse = await fetch(`${apiUrl}/api/users/accessToken/spotify`, {
  //    credentials: 'include',
  //    method: "POST",
  //    headers: {
  //      "Content-Type": "application/json"
  //    },
  //    body: JSON.stringify({
  //      "access_token": access_token,
  //      "refresh_token": null
  //    })
  //  })
  //  const data =  await setTokenResponse.json()
  //  console.log(data)
  //  spotifyClient.setAccessToken(access_token)
  //}


  return (
       <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <h1>Hello World</h1>
      </div>
    </main>
  );
}
