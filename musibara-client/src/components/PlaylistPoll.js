"use client";

import React, {useState, useEffect} from "react";

const PlaylistPoll = ({job_token}) => {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const poll_job = async () => {
      const data = new FormData()
      data.append("job_token", job_token)
      try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/import/status`, {
          credentials: "include",
          method: "POST",
          body: data
        })
        if (result.ok) {
          const data = await result.json()
          setStatus(data.msg)
        }
      } catch (err) {
        console.log(err)
        alert("Error reading playlist import status from server.")
      }
    }
    poll_job();

    // Set up polling every 5 seconds
    const intervalId = setInterval(poll_job, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [])

  if (!job_token) {
    return null
  }

  return (
    <div>
      <h2>Status is: {status}</h2>
      <h2>Token is: {job_token}</h2>
    </div>
  )
}

export default PlaylistPoll
