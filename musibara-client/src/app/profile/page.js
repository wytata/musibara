"use client";

import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText } from '@mui/material';

const Page = () => {
  const [activeTab, setActiveTab] = useState(0);

  const userData = {
    name: "John Doe",
    userName: "johndoe123",
    bio: "A passionate coder and music lover.",
    avatar: "/profile-pic.jpg",
    posts: ["First post", "Second post", "Another post"],
    playlists: ["Coding Vibes", "Chill Beats", "Morning Playlist"],
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3} style={{ padding: '20px' }}>
      <Grid item xs={12}>
        <Card>
          <CardContent style={{ textAlign: 'center' }}>
            <Avatar 
              alt={userData.name} 
              src={userData.avatar} 
              sx={{ width: 100, height: 100, margin: '0 auto' }} 
            />
            <Typography variant="h5" style={{ marginTop: '10px' }}>
              {userData.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              @{userData.userName}
            </Typography>
            <Typography variant="body1" style={{ marginTop: '10px' }}>
              {userData.bio}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Posts" />
              <Tab label="Playlists" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <List>
                {userData.posts.map((post, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={post} />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <List>
                {userData.playlists.map((playlist, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={playlist} />
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default Page;
