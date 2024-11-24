'use client'
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, CardHeader, CardActionArea, CardMedia, IconButton, Drawer, backdropClasses } from '@mui/material';
import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import Sidenav from '@/components/Sidenav';
import NewPost from "@/components/NewPost"
import { useEffect, useState, useRef } from 'react'; import HomeUserGreeting from '@/components/HomeUserGreeting';
import { FaAngleRight } from 'react-icons/fa6';
import { FaAngleLeft } from 'react-icons/fa6';
import { Description } from '@mui/icons-material';
import { FaPlus } from 'react-icons/fa6';
import PostItem from '@/components/PostItem';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//home page
function App() {

    const [userData, setUserData] = useState(null)
    const [itemsPerPage, setItemsPerPage] = useState(3);

    const updateItemsPerPage = () => {
        const baseWidth = 800;
        const incrementWidth = 340;
        const minItemsPerPage = 1;

        // Calculate the number of items per page based on innerWidth
        const itemsPerPage = Math.max(minItemsPerPage, Math.floor((window.innerWidth - baseWidth) / incrementWidth) + 2);

        setItemsPerPage(itemsPerPage);
    };

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);  // New state for drawer
    const toggleDrawer = (open) => () => {
        setIsDrawerOpen(open);
    };

    const retrieveUserInfo = async () => {
        try {
            const fetchResponse = await fetch(apiUrl + `/api/users/me`, {
                method: "GET",
                credentials: "include"
            })
            const data = await fetchResponse.json()
            console.log(data)
            setUserData(data)
        } catch (err) {
            console.log(err)
        }
    }

    const [userPosts, setUserPosts] = useState([])
    const [offSet, setOffSet] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const postResponse = await fetch(apiUrl + `/api/content/posts/feed/${offSet}`, {
                credentials: 'include',
            });

            console.log(postResponse);

            const data = await postResponse.json()
            setUserPosts(prevUserPosts => [...prevUserPosts, ...data])
            setOffSet(prevOffSet => prevOffSet + data.length);
        }
        catch (error) {
            console.error('Error fetching home feed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const [followingList, setFollowingList] = useState([]);
    const [herdList, setHerdList] = useState([]);
    useEffect(() => {
        retrieveUserInfo()
    
        updateItemsPerPage(); // Set initial value
        window.addEventListener('resize', updateItemsPerPage);
    
        const fetchData = async () => {
          try {
            const response = await fetch(apiUrl + `/api/content/homebar`, {
            method: "GET",
            credentials: "include"
          })
    
            const data = await response.json();

            console.log("Following: ", data)
    
            setFollowingList(data.users ? data.users.map(user => ({
              name: user.name,
              userName: user.username,
              avatar: user.url,
            })) : []);
    
            setHerdList(data.herds ? data.herds.map(herd => ({
                name: herd.name,
                description: herd.description,
                avatar: herd.url,
            })) : []);
          } catch(error) {
            console.error('Error with fetching data', error);
          }
        }; 
    
        fetchData();
        fetchPosts();
    
        // Cleanup listener on component unmount
        return () => window.removeEventListener('resize', updateItemsPerPage);
      }, []);


    // NOTE: Uncomment this if we do not want prefetching when scrolling
    // //Works but only fetches if at very bottom
    // const handleScroll = () => {
    //     if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading) {
    //       return;
    //     }
    //     fetchPosts();
    //   };

    const handleScroll = () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        const threshold = 0.90; 
    

        if (scrollPosition >= scrollHeight * threshold && !isLoading) {
            fetchPosts();
        }
    };
      
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading]);


    const [startHerdIndex, setStartHerdIndex] = useState(0);
    const currentHerdItems = herdList ? herdList.slice(startHerdIndex, startHerdIndex + itemsPerPage) : [];
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
    const currentFollowingItems = followingList ? followingList.slice(startFollowingIndex, startFollowingIndex + itemsPerPage) : [];
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
      <div className='App'>
        <main id='block2' className='mainContent'>
          <Box sx={{borderRadius: '1rem', color: '#264653', margin: '8px', padding: '10px'}}>
            <div className='herdsContainer'>
              <h1 className='herdsTitle' style = {{color: 'white' }}>new in herds</h1>
              <div className='herdsCollectionContainer' style={{'--itemsPerPage': itemsPerPage,}}>
                {startHerdIndex <= 0 && (<button onClick={handleHerdPrevious} style={{ opacity:0}}><FaAngleLeft color='white' size={35}/></button>)}
                {startHerdIndex > 0 && (<button onClick={handleHerdPrevious}><FaAngleLeft color='white' size={35}/></button>)}
                <div className='transitionWrapper'>
                  <ul className='herdsCollection'>
                    {currentHerdItems && currentHerdItems.map((herd, index) => (
                      <li key={index} className='herdItem'>
                        <Card sx={{ maxWidth:345, width: '210px', height: 'auto', color: '#264653', backgroundColor: 'white'}} className='herdCard'>
                          <CardActionArea>
                            <CardMedia component='img' image={herd.avatar} alt={herd.name} width='200px' height='auto' crossOrigin="anonymous"/>
                            <CardContent className='cardName' sx={{fontSize: '1.2rem'}}>{herd.name}</CardContent>
                          </CardActionArea>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
                {startHerdIndex + itemsPerPage < herdList.length && (<button onClick={handleHerdNext}><FaAngleRight color='white' size={35}/></button>)}
              </div>
            </div>
            <div className='followingContainer'>
              <h1 className='followingTitle' style = {{color: 'white' }}>new in following</h1>
              <div className='herdsCollectionContainer' style={{'--itemsPerPage': itemsPerPage,}}>
                {startFollowingIndex <= 0 && (<button onClick={handleFollowingPrevious} style={{ opacity:0}}><FaAngleLeft color='white' size={35}/></button>)}
                {startFollowingIndex > 0 && (<button onClick={handleFollowingPrevious}><FaAngleLeft size={35} color='white'/></button>)}
                <div className='transitionWrapper'>
                  <ul className='herdsCollection'>
                    {currentFollowingItems &&
                      currentFollowingItems.map((user, index) => (
                        <li key={index} className='herdItem'>
                          <Link href={`/user/${user.username}`} passHref>
                            <Card
                              sx={{
                                maxWidth: 345,
                                width: '210px',
                                height: 'auto',
                                color: '#264653',
                                cursor: 'pointer', // Ensure the card looks interactive
                              }}
                              className='herdCard'
                            >
                              <CardActionArea>
                                <CardMedia
                                  component='img'
                                  image={user.avatar}
                                  alt={user.name}
                                  width='200px'
                                  height='auto'
                                  crossOrigin='anonymous'
                                />
                                <CardContent
                                  className='cardName'
                                  sx={{ fontSize: '1.2rem' }}
                                >
                                  {user.name}
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
                {startFollowingIndex + itemsPerPage < followingList.length && (<button onClick={handleFollowingNext}><FaAngleRight color='white' size={35}/></button>)}
              </div>
            </div>
          </Box>
          <Box sx={{borderRadius: '1rem', color: '#264653', margin: '8px', padding: '10px', width: '100%'}}>
            <div className="PostContainer" style={{width: '100%'}}>
              <h1 className='followingTitle' style = {{color: 'white' }}>new posts</h1>
              <List>
                  {userPosts?.map(post => (
                    <PostItem key={post.postid} post={post} style={{backgroundColor: 'white'}}/>))
                  }
              </List>
            </div>
          </Box>
        </main>
      </div>
  );
}

export default App;
