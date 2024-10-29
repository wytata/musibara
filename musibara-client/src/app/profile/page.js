"use client";

import React, { useState } from 'react';
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import Link from 'next/link';
import PostItem from '@/components/PostItem';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Page = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [userData, setUserData] = useState({
    name: "Kara Grassau",
    userName: "kawwuh",
    bio: "yeehaw :D",
    avatar: "/profile-pic.jpg",
    playlists: [
      {
        id: 1,
        name: "Coding Vibes",
        image: "/coding-vibes.jpg",
        songs: ["Lo-fi Chill", "Ambient Beats", "Code Mode"],
      },
      {
        id: 2,
        name: "Chill Beats",
        image: "/chill-beats.jpg",
        songs: ["Relaxing Waves", "Smooth Jazz", "Mellow Guitar"],
      },
      {
        id: 3,
        name: "Morning Playlist",
        image: "/morning-playlist.jpg",
        songs: ["Sunrise Delight", "Morning Breeze", "Happy Tunes"],
      },
    ],
  });

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
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', image: '', songs: '' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeletePlaylist = (playlistId) => {
    setUserData((prevData) => ({
      ...prevData,
      playlists: prevData.playlists.filter((playlist) => playlist.id !== playlistId),
    }));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddPlaylist = () => {
    const newId = userData.playlists.length > 0 ? userData.playlists[userData.playlists.length - 1].id + 1 : 1;
    const songsArray = newPlaylist.songs.split(',').map(song => song.trim());
    
    setUserData((prevData) => ({
      ...prevData,
      playlists: [
        ...prevData.playlists,
        {
          id: newId,
          name: newPlaylist.name,
          image: newPlaylist.image,
          songs: songsArray,
        },
      ],
    }));
    
    setNewPlaylist({ name: '', image: '', songs: '' });
    handleCloseDialog();
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Playlists</Typography>
                <IconButton
                  onClick={handleOpenDialog}
                  sx={{
                    backgroundColor: 'transparent',
                    color: 'black',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <List>
                {userData.playlists.map((playlist) => (
                  <ListItem
                    key={playlist.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Link href={`/playlist/${playlist.id}`}>
                      <ListItemText primary={playlist.name} />
                    </Link>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </CardContent>
        </Card>
      </Grid2>

      {/* Dialog for Adding a New Playlist */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            fullWidth
            variant="standard"
            value={newPlaylist.name}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            variant="standard"
            value={newPlaylist.image}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, image: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Songs (comma separated)"
            fullWidth
            variant="standard"
            value={newPlaylist.songs}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, songs: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddPlaylist} variant="contained" color="primary">Add Playlist</Button>
        </DialogActions>
      </Dialog>
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
