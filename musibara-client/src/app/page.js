'use client'
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, CardHeader, CardActionArea, CardMedia, IconButton, Drawer, backdropClasses, Button } from '@mui/material';
import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import Sidenav from '@/components/Sidenav';
import NewPost from "@/components/NewPost"
import { useEffect, useState, useRef , useContext} from 'react'; import HomeUserGreeting from '@/components/HomeUserGreeting';
import Link from 'next/link'; // Import Link from next/link
import { FaAngleRight } from 'react-icons/fa6';
import { FaAngleLeft } from 'react-icons/fa6';
import { Description } from '@mui/icons-material';
import { FaPlus } from 'react-icons/fa6';
import PostItem from '@/components/PostItem';
import CreatePostDrawer from '@/components/CreatePostDrawer';
import AddIcon from "@mui/icons-material/Add";
import { DataContext } from '@/app/layout';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//home page
function App() {
    const { loggedIn } = useContext(DataContext);
    const [userData, setUserData] = useState(null)
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const updateItemsPerPage = () => {
        const baseWidth = 800;
        const incrementWidth = 340;
        const minItemsPerPage = 1;

        // Calculate the number of items per page based on innerWidth
        const itemsPerPage = Math.max(minItemsPerPage, Math.floor((window.innerWidth - baseWidth) / incrementWidth) + 2);

        setItemsPerPage(itemsPerPage);
    };

    const handleCloseMenu = () => {
      setAnchorEl(null);
    };
  
    const handleOpenPostDrawer = () => {
      setIsDrawerOpen(true);
      handleCloseMenu();
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
              username: user.username,
              avatar: user.url,
            })) : []);
    
            setHerdList(data.herds ? data.herds.map(herd => ({
                name: herd.name,
                description: herd.description,
                avatar: herd.url,
                herdid: herd.herdid
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

  console.log(currentHerdItems)  
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
                  <List className='herdsCollection'>
                    {currentHerdItems && currentHerdItems.map((herd, index) => (
                      <ListItem key={index} className='herdItem'>
                        <Link href={`/herd/${herd.herdid}`} key={index} passHref>
                        <Card sx={{ maxWidth:345, width: '210px', height: 'auto', color: '#264653', backgroundColor: 'white'}} className='herdCard'>
                          <CardActionArea component="a">
                            <CardMedia component='img' image={herd.avatar} alt={herd.name} width='200px' height='auto' crossOrigin="anonymous"/>
                            <CardContent className='cardName' sx={{fontSize: '1.2rem'}}>{herd.name}</CardContent>
                          </CardActionArea>
                        </Card>
                        </Link>
                      </ListItem>
                    ))}
                  </List>
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
                  <List className='herdsCollection'>
                    {currentFollowingItems &&
                      currentFollowingItems.map((user, index) => (
                        <ListItem key={index} className='herdItem'>
                          <Link href={`/profile/${user.username}`} passHref>
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
                        </ListItem>
                      ))}
                  </List>
                </div>
                {startFollowingIndex + itemsPerPage < followingList.length && (<button onClick={handleFollowingNext}><FaAngleRight color='white' size={35}/></button>)}
              </div>
            </div>
            {/* Popover for Menu Options */}
            {/* <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <Box sx={{ padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <Button onClick={handleOpenPostDrawer}>make a post</Button>
              </Box>
            </Popover> */}
         
          </Box>
          <Box sx={{borderRadius: '1rem', color: '#264653', margin: '8px', padding: '10px', width: '100%'}}>
            <div className="PostContainer" style={{width: '100%'}}>
              <h1 className='followingTitle' style = {{color: 'white' }}>new posts</h1>
              (loggedIn && (
                <IconButton
                onClick={handleOpenPostDrawer}
                sx={{
                  position: 'fixed',
                  bottom: 30,
                  right: 30,
                  backgroundColor: '#264653',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#1d3b44'
                  },
                  borderRadius: '50%',
                  padding: '15px',
                  zIndex: '1000',
                }}
              >
                <AddIcon fontSize="large" />
              </IconButton>
              ))
              <CreatePostDrawer open={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); }} title={"Share with Musibara"} />
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
