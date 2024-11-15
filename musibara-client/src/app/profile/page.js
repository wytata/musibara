"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button  } from '@mui/material';
import Link from 'next/link'; // Import Link from next/link
import PostItem from '@/components/PostItem';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import spotifyClient from '@/utilities/spotifyClient';
import { exportPlaylist } from '@/utilities/export';
import LinkSpotifyButton from '@/components/LinkSpotify';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const handleSpotifyAccessToken = async () => {
    const hash = window.location.hash
    console.log(hash)
    if (hash) {
      const access_token = hash.replace("#","").split("&")[0].split("=")[1] // Should always be access token but this code needs to be more robust
      const setTokenResponse = await fetch(`${apiUrl}/api/users/accessToken/spotify`, {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "access_token": access_token,
          "refresh_token": null
        })
      })
      const data =  await setTokenResponse.json()
      console.log(data)
      spotifyClient.setAccessToken(access_token)
    }
  }

  // Below function is left as an example for how to retrieve a user's spotify access token
  /*const exportSpotifyPlaylist = async () => {
    var isrc_list = IsrcList.split(' ')
    const getTokenResponse = await fetch(`${apiUrl}/api/users/accessToken/spotify`, {
      credentials: 'include',
    })
    const data = await getTokenResponse.json()
    const token = data.spotifyaccesstoken

    exportPlaylist(isrc_list, "musibara", token)
  }*/

  const currentUser = 103; // TODO: need to change this to be dynamic possibly such as profile/{username} on next.js page (Current Miikurb)
  const [userPosts, setUserPosts] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [userData, setUserData] = useState({
    name: "Kara Grassau",
    userName: "kawwuh",
    bio: "yeehaw :D",
    avatar: "/kara.png",
    banner: "/snoopy.jpg",
  });

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${currentUser}`, { credentials: 'include' });
      const data = await response.json();
      setUserData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch User Playlists
  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/playlists/user/${currentUser}`, { credentials: 'include' });
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  // Fetch User Posts
  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/content/posts/byuserid/${currentUser}`, { credentials: 'include' });
      const data = await response.json();
      setUserPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    console.log("Happen")
    fetchUserInfo(currentUser);
    fetchUserPosts(currentUser);
    fetchUserPlaylists(currentUser);
    handleSpotifyAccessToken();
  }, [currentUser]);

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

  const handleFileChange = (event) => {
    setNewPlaylist((prev) => ({
      ...prev,
      imageFile: event.target.files[0],
    }));
  };

  const handleAddPlaylist = async () => {
    try {
      const formData = new FormData();
      console.log(newPlaylist.name)
      console.log(newPlaylist.description)
    
      formData.append("playlist_name", newPlaylist.name);
      formData.append("playlist_description", newPlaylist.description);
      //formData.append("file", newPlaylist.image); // Ensure `newPlaylist.image` is a File object or use URL if needed

      console.log("Before")
      const response = await fetch(`${apiUrl}/api/playlists/new`, {
        method: "PUT",
        credentials: 'include',
        body: formData,
      });
      console.log("After")

      if (response.ok) {
        const addedPlaylist = await response.json();
        setUserData((prevData) => ({
          ...prevData,
          playlists: [...prevData.playlists, addedPlaylist],
        }));
        setNewPlaylist({ name: '', description: '', image: '' });
        handleCloseDialog();
      } else {
        console.error("Failed to add playlist:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding playlist:", error);
    }
  };

  //console.log(userPosts);

  return (
    <Grid2 container direction="column" spacing={3} style={{ padding: '20px' }}>
      <Grid2 item xs={12}>
        <Card style={{borderRadius: '1rem'}}>
          <CardContent style={{ textAlign: 'center', fontFamily: 'Cabin'}}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Avatar
                alt={userData.name}
                src={userData.profilephoto}
                variant="rounded"
                sx={{ width: '25%', height: '250px', margin: '0 10px' , borderRadius: '1rem'}}
              />
              <Avatar
                alt={userData.name}
                src={userData.bannerphoto}
                variant="rounded"
                sx={{ width: '71%', height: '250px', margin: '0 10px', borderRadius: '1rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant="h3" style={{ marginTop: '10px', fontFamily: 'Cabin', fontWeight: 'bolder' }}>
                  {userData.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" style={{fontFamily: 'Cabin'}}>
                  @{userData.userName}
                </Typography>
                <Typography variant="body1" style={{ marginTop: '10px', fontFamily: 'Cabin' }}>
                  {userData.bio}
                </Typography>
              </Box>
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      herds
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {/*# herds*/}{userData.herdcount}
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold' }}>
                      followers
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold'  }}>
                      {/*# followers*/}{userData.followercount}
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold'  }}>
                      following
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold' }}>
                      {/*# following*/}{userData.followingcount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 item xs={12}>
        <Card style={{borderRadius: '1rem'}}>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ '& .MuiTabs-indicator': { backgroundColor: '#264653'}}}>
              <Tab label="Posts" style={{fontFamily: 'Cabin', color: '#264653'}}/>
              <Tab label="Playlists" style={{fontFamily: 'Cabin', color: '#264653'}}/>
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <List>
                {userPosts && userPosts.map(post => (
                  <PostItem key={post.postid} post={post} />))
                  }
              </List>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" style={{fontFamily: 'Cabin'}}>Playlists</Typography>
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
              {/* Playlist List*/}
              <List>
                {playlists.map((playlist) => (
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
                      <ListItemText primary={playlist.name} sx={{ '& .MuiTypography-root': { fontFamily: 'Cabin'}}}/>
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
        <DialogTitle sx={{fontFamily: 'Cabin'}}>Add New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            fullWidth
            variant="standard"
            value={newPlaylist.name}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
            sx={{ '& .MuiInputBase-input': { fontFamily: 'Cabin' }, '& .MuiInputLabel-root': { fontFamily: 'Cabin' }}}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="standard"
            value={newPlaylist.description}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
            sx={{ '& .MuiInputBase-input': { fontFamily: 'Cabin' }, '& .MuiInputLabel-root': { fontFamily: 'Cabin' }}}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: '16px', fontFamily: 'Cabin' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{fontFamily: 'Cabin', color: '#264653'}}>Cancel</Button>
          <Button onClick={handleAddPlaylist} variant="contained" color="primary" sx={{ backgroundColor: '#264653', color: '#ffffff', fontFamily: 'Cabin' }}>Add Playlist</Button>
        </DialogActions>
      </Dialog>
      <LinkSpotifyButton/>
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
      sx={{ '& .MuiTypography-root': { fontFamily: 'Cabin, sans-serif' }}}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default Page;
