"use client"

import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import Sidenav from '@/components/Sidenav';
import { useEffect, useState } from 'react';
import HomeUserGreeting from '@/components/HomeUserGreeting';

function App() {
  const [userData, setUserData] = useState(null)

  const retrieveUserInfo = async () => {
    try {
      const fetchResponse = await fetch("http://localhost:8000/api/users/me", {
        credentials: "include"
      })
      const data = await fetchResponse.json()
      setUserData(data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    retrieveUserInfo()
  }, [])

  return (
      <div className="App">
        <Sidenav />
        <HomeUserGreeting user={userData}/>
      </div>
  );
}

export default App;
