"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
      // Parse state to get the dynamic username
      const { username } = JSON.parse(decodeURIComponent(state));

      // Exchange the authorization code for tokens (use your server-side logic here)
      fetch("/api/spotify/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Token Exchange Response:", data);

          // Redirect to the dynamic profile page
          router.push(`/profile/${username}`);
        })
        .catch((err) => {
          console.error("Error during token exchange:", err);
          router.push(`/error?message=Token exchange failed`);
        });
    }
  }, [router, searchParams]);

  return <div>Processing Spotify callback...</div>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Callback />
    </Suspense>
  );
}
