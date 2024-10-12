"use client"

import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import Sidenav from './components/Sidenav';

const retrieveUserInfo = async () => {
  const fetchResponse = await fetch("http://localhost:8000/api/users/me", {
    credentials: "include"
  })
  let data = await fetchResponse.json()
  return data
}

async function App() {
  let data = await retrieveUserInfo()
  console.log(data)
  return (
      <div className="App">
        <Sidenav />
        <button onClick={() => {console.log("hello world")}}>check this out</button>
      </div>
  );
}

export default App;
