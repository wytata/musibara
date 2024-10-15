"use client";
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, CardHeader, CardActionArea, CardMedia } from '@mui/material';
import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import Sidenav from '@/components/Sidenav';
import { useEffect, useState } from 'react';
import HomeUserGreeting from '@/components/HomeUserGreeting';

function App() {

  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const followingList = [
    {
      name: "Kara Grassau",
      userName: "kawwuh",
      avatar: "/kara.png",
      },
    {
        name: "Xena Bui",
        userName: "ko0l4kat",
        avatar: "/xena.jpg",
    },
    {
        name: "Maria Castagnetti",
        userName: "monalessa",
        avatar: "/maria.jpg",
    }
  ];

  const herdList = [
    {
      name: "Frank Ocean Stans",
      avatar: "/frank.jpg",
    },
    {
        name: "90s RnB",
        avatar: "/rnb.jpg",
    },
    {
        name: "Short n Sweet",
        avatar: "/shortnsweet.jpg",
    }
  ];

  return (
      <div className="App">
        <div id="block1" className={`${isCollapsed ? 'collapsed' : ''}`}>
          <Sidenav toggleSidebar={toggleSidebar}/>
        </div>
        <main id="block2" className='mainContent'>
          <div className='herdsContainer'>
            <h1 className='herdsTitle'>new in herds</h1>
            <ul className='herdsCollection'>
              {herdList.map((herd, index) => (
                <li key={index} className="herdItem">
                  <Card sx={{ maxWidth:345}} className="herdCard">
                    <CardActionArea>
                      <CardMedia component="img" image={herd.avatar} alt={herd.name}/>
                      <CardContent className="cardName">
                        {herd.name}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
          <div className='followingContainer'>
            <h1 className='followingTitle'>new in following</h1>
            <ul className='herdsCollection'>
              {followingList.map((following, index) => (
                  <li key={index} className="herdItem">
                    <Card sx={{ maxWidth:345}} className="herdCard">
                      <CardActionArea>
                        <CardMedia component="img" image={following.avatar} alt={following.name}/>
                        <CardContent className="cardName">
                          {following.name}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </li>
                ))}
            </ul>
          </div>
        </main>
      </div>
  );
}

export default App;
