"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleAuthCode } from '@/utilities/spotifyServerFunctions';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    console.log(access_token)
    console.log(refresh_token)

    if (error) {
      console.error("Spotify Authorization Error:", error);
      router.push(`/error?message=${encodeURIComponent(error)}`);
      return;
    }

    if (code && state) {

      // Process Spotify authorization
      handleAuthCode(code, state);
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
