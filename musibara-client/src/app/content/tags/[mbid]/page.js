'use client'
import { CircularProgress, Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, CardHeader, CardActionArea, CardMedia, IconButton, Drawer, backdropClasses } from '@mui/material';
import { fetchServerResponse } from 'next/dist/client/components/router-reducer/fetch-server-response';
import Sidenav from '@/components/Sidenav';
import NewPost from "@/components/NewPost"
import { useEffect, useState, useRef } from 'react'; import HomeUserGreeting from '@/components/HomeUserGreeting';
import Link from 'next/link'; // Import Link from next/link
import { FaAngleRight } from 'react-icons/fa6';
import { FaAngleLeft } from 'react-icons/fa6';
import { Description } from '@mui/icons-material';
import { FaPlus } from 'react-icons/fa6';
import PostItem from '@/components/PostItem';
import { useParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function Tags() {

    const [userData, setUserData] = useState(null)
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const { mbid } = useParams();
    const [tagData, setTagData] = useState(null)

    const retrieveTagInfo = async () => {
        try {
            const fetchResponse = await fetch(apiUrl + `/api/content/posts/tag/info/${mbid}`, {
                method: "GET",
                credentials: "include"
            })
            const data = await fetchResponse.json()
            console.log('Tag Data:', data);
            setTagData(prevTagData => ({
                ...prevTagData,
                name: data.name.toLowerCase()

            }));
            if (data.resourcetype==="artists" && data.mbdata.artist.country){
                const text = `country of origin: ${data.mbdata.artist.country.toLowerCase()}`
                setTagData(prevTagData => ({
                    ...prevTagData,
                    description: text
    
                }));
            }
            else if(data.resourcetype==="albums"){
                const artistText = data.mbdata.recording['artist-credit-phrase'] 
                        ? `by ${data.mbdata.recording['artist-credit-phrase'].toLowerCase()}`
                        : 'Unknown artist';
                setTagData(prevTagData => ({
                    ...prevTagData,
                    description: data.mbdata.recording.disambiguation,
                    artists: artistText
                }));
            }
            else if(data.resourcetype==="songs"){
                const artistText = data.mbdata.recording['artist-credit-phrase'] 
                        ? `by ${data.mbdata.recording['artist-credit-phrase'].toLowerCase()}`
                        : 'Unknown artist';
                setTagData(prevTagData => ({
                    ...prevTagData,
                    artists: artistText
    
                }));
            }
            else{
                setTagData(prevTagData => ({
                    ...prevTagData,
                    description: "see what other capybaras are barking about"
    
                }));
            }
            
        } catch (err) {
            console.log(err)
        }
    }

    const retrieveUserInfo = async () => {
        try {
            const fetchResponse = await fetch(apiUrl + `/api/users/me`, {
                method: "GET",
                credentials: "include"
            })
            const data = await fetchResponse.json();
            setUserData(data);
            console.log(data);
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
            const postResponse = await fetch(apiUrl + `/api/content/posts/feed/${mbid}/${offSet}`, {
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

    // Initial fetch
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([retrieveTagInfo(), retrieveUserInfo(), fetchPosts()]);
        };

        fetchData();
    }, [mbid]);

    if (tagData === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }




    return (
        <div className='App' style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <main id='block2' className='mainContent'>
                <Box sx={{ borderRadius: '1rem', color: '#264653', margin: '8px', padding: '10px', width: '100%' }}>
                    <div className="PostContainer" style={{ width: '100%' }}>
                        

                    <h1 className='followingTitle'
                        style={{
                            color: 'white',
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            width: '100%' 
                        }}
                    >
                        {`posts related to ${tagData.name}`}
                    </h1>


                    {tagData.artists && (
                        <h3 className='followingTitle'
                            style={{
                                color: 'white',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal',
                                width: '85%' 
                            }}
                        >
                            {`${tagData.artists}`}
                        </h3>
                    )}

                    {tagData.description && (
                        <h3 className='followingTitle'
                            style={{
                                color: 'white',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal',
                                width: '85%', 
                                marginBottom: '5px',
                                fontSize: '1.5rem'
                            }}
                        >
                            {`${tagData.description}`}
                        </h3>
                    )}
                        <List>
                            {userPosts?.map(post => (
                                <PostItem key={post.postid} post={post} style={{ backgroundColor: 'white' }} />))
                            }
                        </List>
                    </div>
                </Box>
            </main>
        </div>
    );
}

export default Tags;
