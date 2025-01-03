"use client";

import localFont from "next/font/local";
import Sidenav from "@/components/Sidenav";
import "./globals.css";
import { useState, createContext, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IconButton } from "@mui/material";
import { getUserPlaylistsSpotify, handleAuthCode } from '@/utilities/spotifyServerFunctions';
import { getUserPlaylistsApple } from '@/utilities/appleMusicServerFunctions';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const DataContext = createContext();

export default function RootLayout({ children }) {

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState(false);  
  const [loggedIn, setLoggedIn] = useState(false);
  const [userPosts, setUserPosts] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [imports, setImports] = useState([])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const retrieveUserInfo = async () => {
    console.log("Me Call")
    try {
      const fetchResponse = await fetch(apiUrl + `/api/users/me`, {
        method: "GET",
        credentials: "include"
    })
      const data = await fetchResponse.json() 
      console.log(data)

      if (data.spotifyaccesstoken && data.spotifyrefreshtoken) {
        try {
          console.log("Retrieving Spotify playlists");
          const sPlaylists = await getUserPlaylistsSpotify(
            data.spotifyaccesstoken,
            data.spotifyrefreshtoken
          );
          data.spotifyPlaylists = sPlaylists.playlists;
          const access_token = sPlaylists.access_token;
  
          const set_token_response = await fetch(
            `${apiUrl}/api/users/accessToken/spotify`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                access_token: access_token,
                refresh_token: data.spotifyrefreshtoken,
              }),
            }
          );
  
          if (!set_token_response.ok) {
            console.log("Failed to reset Spotify access/refresh tokens");
          } else {
            data.spotifyaccesstoken = access_token;
          }
        } catch (spotifyError) {
          console.error("Error retrieving Spotify playlists:", spotifyError);
          data.spotifyPlaylists = []; // Default to an empty array on error
        }
      }


      if (data.applemusictoken) {
        console.log("Retrieving Apple playlists")
        const aPlaylists = await getUserPlaylistsApple(data.applemusictoken)
        data.applePlaylists = aPlaylists
      }
      console.log(data)
      setUserData(data)
      if (fetchResponse.ok) {
        setLoggedIn(true)
      } else {
        setLoggedIn(false) // commented for debug
      }
    } catch (err) {
      console.log("Error retrieving user info")
      console.log(err)
      setLoggedIn(false) //commented for debug
    }
  }

  const retrieveUserPlaylists = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/playlists/`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch Musibara playlists");
      }
  
      const dataplaylists = await response.json();
  
      if (dataplaylists.length === 0) {
        console.log("No Musibara playlists found.");
      } else {
        console.log("Playlists retrieved successfully:", dataplaylists);
        const importStates = dataplaylists && dataplaylists.map((playlist) => {
          return {"externalid": playlist.externalid, "completed": playlist.completed}
        })
        setImports(importStates)
        console.log("After import states");
        setPlaylists(dataplaylists) // Update the playlists state
      }
    } catch (error) {
      console.error("Error retrieving Musibara playlists:", error);
    }
  };

  const fetchUserPosts = async () => {
    const postResponse = await fetch(apiUrl + `/api/content/posts/me`, {
      credentials: 'include',
    });

    console.log(postResponse);
    if(postResponse.status == 401) {
      window.location = "/login";
    }

    const jsonData = await postResponse.json()
    setUserPosts(jsonData)
  }

  useEffect(() => {
    retrieveUserInfo()  
  }, [loggedIn]);

  if (userData && userData.spotifyPlaylists && imports) {
    userData.spotifyPlaylists.forEach(playlist=> {
      const importObject = imports.find(item => item.externalid === playlist.id) 
      if (importObject) {
        playlist.importStatus = importObject.completed
      }
    });
  }
  if (userData && userData.applePlaylists && imports) {
    userData.applePlaylists.forEach(playlist=> {
      const importObject = imports.find(item => item.externalid === playlist.id) 
      if (importObject) {
        playlist.importStatus = importObject.completed
      }
    });
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <DataContext.Provider value={{userData, setUserData, retrieveUserInfo,
            loggedIn, setLoggedIn,   
            userPosts, setUserPosts, fetchUserPosts,
            playlists, setPlaylists, retrieveUserPlaylists}}>
        <div className="fullContainer" style={{minHeight: '100vh', display: 'flex'}}>
          <div className={`leftContainer ${isCollapsed ? "collapsed" : ""}`} style={{backgroundColor: '#92a2a9', padding: '2rem 0', position: 'sticky', height: '100vh', top: 0, overflow: 'hidden'}}>
            <IconButton className="hamburgerButton" onClick={toggleCollapse} size="small" style={{color: 'white', backgroundColor: '#264653', margin: '8px'}}>
              <GiHamburgerMenu />
            </IconButton>
            <Sidenav logged={loggedIn} setLogged={setLoggedIn}/>
          </div>
          <div className="rightContainer" style={{flexGrow: '1', height: '100%', overflowX: 'hidden'}}>
            {children}
          </div>
        </div>
        </DataContext.Provider>
      </body>
    </html>
  );
}
