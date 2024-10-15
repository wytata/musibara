"use client";

import React, { useState } from 'react';
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText } from '@mui/material';
import PostItem from '@/components/PostItem';

const Page = () => {

  const userData = {
    name: "Kara Grassau",
    userName: "kawwuh",
    bio: "yeehaw :D",
    avatar: "/profile-pic.jpg",
    playlists: ["Coding Vibes", "Chill Beats", "Morning Playlist"],
  };

  const posts = [
    {
      postid: 1,
      userid: "djCoolBeats",
      title: "Check out my new track: Chill Vibes",
      content: "I just dropped a new chill track, perfect for those late-night coding sessions! Give it a listen and let me know what you think.",
      likescount: 120,
      numcomments: 25,
      tags: ["chill", "lofi", "electronic"],
    },
    {
      postid: 2,
      userid: "djCoolBeats",
      title: "Indie Rock Compilation",
      content: "Here’s a playlist of my favorite indie rock tracks from up-and-coming bands. Hope you enjoy the fresh sounds!",
      likescount: 85,
      numcomments: 18,
      tags: ["indie", "rock", "playlist"],
    },
    {
      postid: 3,
      userid: "djCoolBeats",
      title: "Bass-heavy beats for your workout",
      content: "Need some energy? Check out this collection of bass-heavy tracks that will keep you pumped during your workout sessions!",
      likescount: 200,
      numcomments: 40,
      tags: ["bass", "workout", "beats"],
    }
  ];

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid2 container direction="column" spacing={3} style={{ padding: '20px' }}>
      <Grid2 item xs={12}>
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
      </Grid2>

      <Grid2 item xs={12}>
        <Card>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Posts" />
              <Tab label="Playlists" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <List>
                {posts.map(post => (
                  <PostItem key={post.postid} post={post} />
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
      </Grid2>
    </Grid2>
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
