"use client";

import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton, Container } from '@mui/material';
import { Title } from '@mui/icons-material';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => { 
    const fetchNotifications = async () => { 
      try { 
        const response = await fetch(`${apiUrl}/api/users/notifications/`, { method: "GET", credentials: "include" }); 
        if (response.ok) { 
          const data = await response.json(); 
          setNotifications(data); 
        } else { 
          console.error('Error fetching notifications:', response.statusText); 
        } 
      } catch (error) { 
        console.error('Error fetching notifications:', error); 
      } 
    }; 
    fetchNotifications();
  }, []);

  return (
    <Container className="notifPage" sx={{backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
        <Box className="subcontainer" sx={{backgroundColor: '#ffffff', padding: '20px', minHeight:'100vh', marginTop: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '1rem' }}>
            <Box sx={{color: 'black'}}>
                <h1 style={{ fontSize: '3rem', color: '#264653' }}>notifications</h1>
                <List>
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <ListItem key={index} sx={{background: '#e6eded', borderRadius: '1rem', marginBottom: '8px', color: '#264653'}}>
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