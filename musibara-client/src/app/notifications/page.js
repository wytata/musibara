"use client";

import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton, Container } from '@mui/material';
import { Title } from '@mui/icons-material';

const Page = () => {
  return (
    <Container className="notifPage" sx={{backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
        <Box className="subcontainer" sx={{backgroundColor: '#ffffff', padding: '20px', minHeight:'100vh', marginTop: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '1rem' }}>
            <Box sx={{color: 'black'}}>
                <h1 style={{ fontSize: '3rem' }}>notifications</h1>
                <List>
                    <ListItem>Notification 1</ListItem>
                    <ListItem>Notification 2</ListItem>
                    <ListItem>Notification 3</ListItem>
                </List>
            </Box>
        </Box>
    </Container>
  );
};

export default Page;