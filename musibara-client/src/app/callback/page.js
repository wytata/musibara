"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Spotify Authorization Error:", error);
      router.push(`/error?message=${encodeURIComponent(error)}`);
      return;
    }

    if (code && state) {
      const { username } = JSON.parse(decodeURIComponent(state));

      // Process Spotify authorization
      processSpotifyAuth(code, username);
    }
  }, [router, searchParams]);

  const processSpotifyAuth = async (code, username) => {
    try {
      // Exchange the authorization code for tokens
      const tokenResponse = await fetch(`${apiUrl}/api/spotify/exchange-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to exchange authorization code");
      }

      const { access_token, refresh_token } = await tokenResponse.json();

      // Save tokens to the backend
      const saveTokensResponse = await fetch(`${apiUrl}/api/users/accessToken/spotify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          access_token,
          refresh_token,
        }),
      });

      if (!saveTokensResponse.ok) {
        throw new Error("Failed to save Spotify tokens to backend");
      }

      // Redirect to the user's profile page
      router.push(`/profile/${username}`);
    } catch (error) {
      console.error("Error during Spotify authorization process:", error);
      router.push(`/error?message=${encodeURIComponent(error.message)}`);
    }
  };

  return <div>Processing Spotify callback...</div>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Callback />
    </Suspense>
  );
}
