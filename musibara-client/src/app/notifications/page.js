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
        const response = await fetch(`${apiUrl}/api/user/notifications/`, { credentials: 'include' }); 
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
                <h1 style={{ fontSize: '3rem' }}>notifications</h1>
                <List>
                    {notifications.legnth > 0 ? (
                      notifications.map((notification, index) => (
                        <ListItem key={index}>
                          {notification.notificationtype} - {notification.username} - {notification.content} 
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>no notifications found, get posting!</ListItem>
                    )}
                </List>
            </Box>
        </Box>
    </Container>
  );
};

export default Page;