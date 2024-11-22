"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton, Container } from '@mui/material';
import { Title } from '@mui/icons-material';
import  {useRouter}  from 'next/navigation';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [notifications, setNotifications] = useState([]);
  const [offSet, setOffSet] = useState(0);
  const router = useRouter();
  const listRef = useRef(null);
  const loadingRef = useRef(false); 

  useEffect(() => { 
    const fetchNotifications = async () => { 
      if (loadingRef.current) return;
      loadingRef.current = true;

      try { 
        const response = await fetch(`${apiUrl}/api/users/notifications/${offSet}`, { 
          method: "GET", 
          credentials: "include" 
        });

        if (response.ok) { 
          const data = await response.json(); 
          setNotifications(prevNotifications => [...prevNotifications, ...data]);
          setOffSet(prevOffSet => prevOffSet + data.length);
        } else { 
          console.error('Error fetching notifications:', response.statusText); 
        } 
      } catch (error) { 
        console.error('Error fetching notifications:', error); 
      } finally {
        loadingRef.current = false;
      }
    };

    fetchNotifications();
  }, [offSet]); 

  //triggers change with offset to fetch
  useEffect(() => {
    const handleScroll = () => {
      if (listRef.current) {
        const bottom = listRef.current.scrollHeight === listRef.current.scrollTop + listRef.current.clientHeight;
        const distanceFromBottom = listRef.current.scrollHeight - listRef.current.scrollTop - listRef.current.clientHeight;


        if (distanceFromBottom <= 100 && notifications.length > 0) {
          setOffSet(prevOffSet => prevOffSet);
        }
      }
    };

    const list = listRef.current;
    if (list) {
      list.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (list) {
        list.removeEventListener('scroll', handleScroll);
      }
    };
  }, [notifications]);

  const handleNotificationClick = (notificationType, postId, commentId) => {


    let route = "";
    switch (notificationType) {
      case 'likes':
        route = `/`;
        break;
      case 'commentlikes':
        route = `/comment-likes/${postId}/${commentId}`;
        break;
      case 'comments':
        route = `/comments/${postId}/${commentId}`;
        break;
      case 'commentreplies':
        route = `/comment-replies/${postId}/${commentId}`;
        break;
      case 'follows':
        route = `/`;
        break;
      default:
        route = '/'; 
    }

    router.push(route);
  };

  return (
    <Container className="notifPage" sx={{backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
        <Box className="subcontainer" sx={{backgroundColor: '#ffffff', padding: '20px', minHeight:'100vh', marginTop: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '1rem' }}>
            <Box sx={{color: 'black'}}>
                <h1 style={{ fontSize: '3rem', color: '#264653' }}>notifications</h1>
                <List>
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <ListItem key={index} sx={{background: '#e6eded', borderRadius: '1rem', marginBottom: '8px', color: '#264653'}} onClick={() => handleNotificationClick(notification.notificationtype, notification.postid, notification.postcommentid)}>
                          {notification.notificationtype === 'likes' && (
                            <Box sx={{display: 'flex', alignItems: 'center' }}>
                              <img
                                src={notification.url} 
                                alt={`${notification.username} pfp`}
                                style = {{
                                  width: '15%',
                                  height: 'auto',
                                  borderRadius: '1rem',
                                  marginRight: '10px'
                                }}
                              />
                              <span sx={{color: '#264653', fontSize: 'large'}}>{notification.username} liked your post</span>
                            </Box>
                          )}
                          {notification.notificationtype === 'commentlikes' && (
                            <Box sx={{display: 'flex', alignItems: 'center' }}>
                              <img
                                src={notification.url} 
                                alt={`${notification.username} pfp`}
                                style = {{
                                  width: '15%',
                                  height: 'auto',
                                  borderRadius: '1rem',
                                  marginRight: '10px'
                                }}
                              />
                              <span sx={{color: '#264653', fontSize: 'large'}}>{notification.username} liked your comment</span>
                            </Box>
                          )}
                          {notification.notificationtype === 'comments' && (
                            <Box sx={{display: 'flex', alignItems: 'center' }}>
                              <img
                                src={notification.url} 
                                alt={`${notification.username} pfp`}
                                style = {{
                                  width: '15%',
                                  height: 'auto',
                                  borderRadius: '1rem',
                                  marginRight: '10px'
                                }}
                              />
                              <span sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                <p sx={{color: '#264653', fontSize: 'large'}}>{notification.username} commented on your post</p>
                                <p sx={{color: '#264653'}}>{notification.content}</p>
                              </span>
                            </Box>
                          )}
                          {notification.notificationtype === 'commentreplies' && (
                            <Box sx={{display: 'flex', alignItems: 'center' }}>
                              <img
                                src={notification.url} 
                                alt={`${notification.username} pfp`}
                                style = {{
                                  width: '15%',
                                  height: 'auto',
                                  borderRadius: '1rem',
                                  marginRight: '10px'
                                }}
                              />
                              <span sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                <p sx={{color: '#264653', fontSize: 'large'}}>{notification.username} replied to your comment</p>
                                <p sx={{color: '#264653'}}>{notification.content}</p>
                              </span>
                            </Box>
                          )}
                          {notification.notificationtype === 'follows' && (
                            <Box sx={{display: 'flex', alignItems: 'center' }}>
                              <img
                                src={notification.url} 
                                alt={`${notification.username} pfp`}
                                style = {{
                                  width: '15%',
                                  height: 'auto',
                                  borderRadius: '1rem',
                                  marginRight: '10px'
                                }}
                              />
                              <span sx={{color: '#264653', fontSize: 'large'}}>{notification.username} followed you</span>
                            </Box>
                          )}
                        </ListItem>
                      ))
                    ) : (
                      <ListItem sx={{color: '#264653', fontSize: 'large'}}>no notifications found, get posting!</ListItem>
                    )}
                </List>
            </Box>
        </Box>
    </Container>
  );
};
export default Page;