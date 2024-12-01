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
    const state = searchParams.get("state");
    const error = searchParams.get("error");

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
