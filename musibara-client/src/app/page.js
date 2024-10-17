"use client"
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, CardHeader, CardActionArea, CardMedia } from '@mui/material';
import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import Sidenav from '@/components/Sidenav';
import { useEffect, useState } from 'react';
import HomeUserGreeting from '@/components/HomeUserGreeting';
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";


function App() {
  
  const [userData, setUserData] = useState(null)
  const [itemsPerPage, setItemsPerPage] = useState(3); 

  const updateItemsPerPage = () => {
    if (window.innerWidth < 800) {
      setItemsPerPage(1); // For small screens
    } else if (window.innerWidth < 1100) {
      setItemsPerPage(2); // For medium screens
    } else if (window.innerWidth < 1400) {
      setItemsPerPage(3); // For large screens
    } else {
      setItemsPerPage(4);
    }
  };

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

    updateItemsPerPage(); // Set initial value
    window.addEventListener('resize', updateItemsPerPage);

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', updateItemsPerPage);

  }, []);

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
    },
    {
      name: "Short n Sweet",
      avatar: "/shortnsweet.jpg",
  },
  {
    name: "Short n Sweet",
    avatar: "/shortnsweet.jpg",
  }   
  ];

  const [startHerdIndex, setStartHerdIndex] = useState(0);
  const currentHerdItems = herdList.slice(startHerdIndex, startHerdIndex + itemsPerPage);
  const handleHerdNext = () => {
    if (startHerdIndex + itemsPerPage < herdList.length) {
      setStartHerdIndex(startHerdIndex + itemsPerPage);
    }
  };
  const handleHerdPrevious = () => {
    if (startHerdIndex - itemsPerPage >= 0) {
      setStartHerdIndex(startHerdIndex - itemsPerPage);
    }
  };

  const [startFollowingIndex, setStartFollowingIndex] = useState(0);
  const currentFollowingItems = followingList.slice(startFollowingIndex, startFollowingIndex + itemsPerPage);
  const handleFollowingNext = () => {
    if (startFollowingIndex + itemsPerPage < followingList.length) {
      setStartFollowingIndex(startFollowingIndex + itemsPerPage);
    }
  };
  const handleFollowingPrevious = () => {
    if (startFollowingIndex - itemsPerPage >= 0) {
      setStartFollowingIndex(startFollowingIndex - itemsPerPage);
    }
  };

  return (
      <div className="App">
        <main id="block2" className='mainContent'>
          <div className='herdsContainer'>
            <h1 className='herdsTitle'>new in herds</h1>
            <div className='herdsCollectionContainer' style={{'--itemsPerPage': itemsPerPage,}}>
              <div className='transitionWrapper'>
                <ul className='herdsCollection'>
                  {currentHerdItems.map((herd, index) => (
                    <li key={index} className="herdItem">
                      <Card sx={{ maxWidth:345}} className="herdCard">
                        <CardActionArea>
                          <CardMedia component="img" image={herd.avatar} alt={herd.name}/>
                          <CardContent className="cardName">{herd.name}</CardContent>
                        </CardActionArea>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
              {startHerdIndex > 0 && (<button onClick={handleHerdPrevious}><FaAngleLeft size={35}/></button>)}
              {startHerdIndex + itemsPerPage < herdList.length && (<button onClick={handleHerdNext}><FaAngleRight size={35}/></button>)}
            </div>
          </div>
          <div className='followingContainer'>
            <h1 className='followingTitle'>new in following</h1>
            <div className='herdsCollectionContainer' style={{'--itemsPerPage': itemsPerPage,}}>
              <div className='transitionWrapper'>
                <ul className='herdsCollection'>
                  {currentFollowingItems.map((herd, index) => (
                    <li key={index} className="herdItem">
                      <Card sx={{ maxWidth:345}} className="herdCard">
                        <CardActionArea>
                          <CardMedia component="img" image={herd.avatar} alt={herd.name}/>
                          <CardContent className="cardName">{herd.name}</CardContent>
                        </CardActionArea>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
              {startFollowingIndex > 0 && (<button onClick={handleFollowingPrevious}><FaAngleLeft size={35}/></button>)}
              {startFollowingIndex + itemsPerPage < followingList.length && (<button onClick={handleFollowingNext}><FaAngleRight size={35}/></button>)}
            </div>
          </div>
        </main>
      </div>
  );
}

export default App;
