"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button  } from '@mui/material';
import Link from 'next/link'; // Import Link from next/link
import PostItem from '@/components/PostItem';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImportExport } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { exportPlaylistSpotify, exportPlaylistApple } from '@/utilities/export';
import { getUserPlaylistsSpotify, handleAuthCode } from '@/utilities/spotifyServerFunctions';
import { getUserPlaylistsApple } from '@/utilities/appleMusicServerFunctions';
import LinkSpotifyButton from '@/components/LinkSpotify';
import spotifyClient from '@/utilities/spotifyClient';
import Image from 'next/image';
import { importSpotifyPlaylist, importAppleMusicPlaylist } from '@/utilities/import';
import Script from 'next/script';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = ({searchParams}) => {
  const code = searchParams.code
  const access_token = searchParams.access_token
  const refresh_token = searchParams.refresh_token

  const [userData, setUserData] = useState(null)
  const [music, setMusic] = useState(null)

  const retrieveUserInfo = async () => {
    try {
      const fetchResponse = await fetch(apiUrl + `/api/users/me`, {
        method: "GET",
        credentials: "include"
      })
      const data = await fetchResponse.json()
      //setUserData(data) 
      if (data.spotifyaccesstoken && data.spotifyrefreshtoken) {
        const playlists = await getUserPlaylistsSpotify(data.spotifyaccesstoken, data.spotifyrefreshtoken)
        data.spotifyPlaylists = playlists.playlists
        const access_token = playlists.access_token
        setUserData(data)
        const set_token_response = await fetch(`${apiUrl}/api/users/accessToken/spotify`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            "access_token": access_token,
            "refresh_token": data.spotifyrefreshtoken
          })
        }) 
        if (!set_token_response.ok) {
          console.log("Failed to reset spotify access/refresh tokens")
        } else {
          data.spotifyaccesstoken = access_token
        }
      }
      if (data.applemusictoken) {
        const playlists = await getUserPlaylistsApple(data.applemusictoken)
        data.applePlaylists = playlists
        setUserData(data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  //const currentUser = "jonesjessica"; // TODO: need to change this to be dynamic possibly such as profile/{username} on next.js page
  const [userPosts, setUserPosts] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  //const [userData, setUserData] = useState({
  //  name: "Kara Grassau",
  //  username: "kawwuh",
  //  bio: "yeehaw :D",
  //  avatar: "/kara.png",
  //  banner: "/snoopy.jpg",
  //  playlists: [
  //    {
  //      id: 1,
  //      name: "Coding Vibes",
  //      image: "/coding-vibes.jpg",
  //      songs: ["Lo-fi Chill", "Ambient Beats", "Code Mode"],
  //    },
  //    {
  //      id: 2,
  //      name: "Chill Beats",
  //      image: "/chill-beats.jpg",
  //      songs: ["Relaxing Waves", "Smooth Jazz", "Mellow Guitar"],
  //    },
  //    {
  //      id: 3,
  //      name: "Morning Playlist",
  //      image: "/morning-playlist.jpg",
  //      songs: ["Sunrise Delight", "Morning Breeze", "Happy Tunes"],
  //    },
  //  ],
  //});

  const fetchUserPosts = async (username) => {
    const postResponse = await fetch(apiUrl + `/api/content/posts/byuserid/${username}`)
    const jsonData = await postResponse.json()
    setUserPosts(jsonData)
  }

  const linkAppleMusic = async () => {
    const authResponse = await music.authorize() // MUT
    try {
      const setTokenResponse = await fetch(`${apiUrl}/api/users/accessToken/applemusic`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          "access_token": authResponse,
          "refresh_token": null
        })
      })
      if (setTokenResponse.ok) {
        window.location.reload()
      } else {
        const data = await setTokenResponse.json()
        alert(data.msg)
      }
    } catch (err) {
      alert(err)
    }
    console.log(authResponse)
  }

  useEffect(() => {
    window.addEventListener('musickitloaded', async () => {
      try {
        await MusicKit.configure({
          developerToken: process.env.NEXT_PUBLIC_APPLE_TOKEN,
          app: {
            name: 'Musibara',
            build: '1.0',
          },
        });
      } catch (err) {
        console.log(err)
      }
      // MusicKit instance is available
      const kit = MusicKit.getInstance();
      console.log(kit)
      setMusic(kit)
    })
    console.log("Retrieving user info")
    retrieveUserInfo()
    if (code) {
      handleAuthCode(code)
    }
    console.log(userData)
    if (access_token && refresh_token) {
      fetch(`${apiUrl}/api/users/accessToken/spotify`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          "access_token": access_token,
          "refresh_token": refresh_token
        })
      }).then((data) => {
          console.log(data)
          window.location.replace("/profile")
      })
    }
    //if (!code && !access_token) {
    //  fetchUserPosts(currentUser);
    //}
  }, [access_token, currentUser]);

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
    setOpenDialog(true); };

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


  return (
    <Suspense>
    <Script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" async/>
    <Grid2 container direction="column" spacing={3} style={{ padding: '20px' }}>
      <Grid2 item xs={12}>
        <Card style={{borderRadius: '1rem'}}>
          <CardContent style={{ textAlign: 'center', fontFamily: 'Cabin'}}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Avatar
                alt={userData && userData.name}
                src={userData && userData.avatar}
                variant="rounded"
                sx={{ width: '25%', height: '250px', margin: '0 10px' , borderRadius: '1rem'}}
              />
              <Avatar
                alt={userData && userData.name}
                src={userData && userData.banner}
                variant="rounded"
                sx={{ width: '71%', height: '250px', margin: '0 10px', borderRadius: '1rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant="h3" style={{ marginTop: '10px', fontFamily: 'Cabin', fontWeight: 'bolder' }}>
                  {userData && userData.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" style={{fontFamily: 'Cabin'}}>
                  @{userData && userData.username}
                </Typography>
                <Typography variant="body1" style={{ marginTop: '10px', fontFamily: 'Cabin' }}>
                  {userData && userData.bio}
                </Typography>
              </Box>
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      herds
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {/*# herds*/}15
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold' }}>
                      followers
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold'  }}>
                      {/*# followers*/}14
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold'  }}>
                      following
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white' , fontWeight: 'bold' }}>
                      {/*# following*/}25.2k
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
              <List>
                {userData && userData.playlists && userData.playlists.map((playlist) => (
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
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" style={{fontFamily: 'Cabin'}}>Spotify Playlists</Typography>
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
                {userData && userData.spotifyPlaylists && userData.spotifyPlaylists.map((playlist) => (
                  <ListItem
                    key={playlist.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={async () => {
                          importSpotifyPlaylist(playlist.id, playlist.name, userData.spotifyaccesstoken, userData.spotifyrefreshtoken)
                        }}
                      >
                        <ImportExport/>
                      </IconButton>
                    }
                  >
                      <Image src={playlist.images && playlist.images[0].url} width={60} height={50} alt={`Image for playlist ${playlist.name}`} />
                      <ListItemText primary={playlist.name} sx={{ '& .MuiTypography-root': { fontFamily: 'Cabin'}}}/>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" style={{fontFamily: 'Cabin'}}>Apple Music Playlists</Typography>
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
                {userData && userData.applePlaylists && userData.applePlaylists.map((playlist) => (
                  <ListItem
                    key={playlist.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={async () => {
                            importAppleMusicPlaylist(playlist.id, playlist.attributes.name, userData.applemusictoken)
                          }}
                      >
                        <ImportExport/>
                      </IconButton>
                    }
                  >
                      { playlist.attributes.artwork && playlist.attributes.artwork.url 
                      ? <Image src={playlist.attributes.artwork.url} alt={`Image for playlist ${playlist.attributes.name}`} width={60} height={50} />
                      : null
                      }
                      <ListItemText primary={playlist.attributes.name} sx={{ '& .MuiTypography-root': { fontFamily: 'Cabin'}}}/>
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
            variant="standard" value={newPlaylist.name}
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
      <button onClick={linkAppleMusic}>Link Apple Music Account</button>
    </Grid2>
    </Suspense>
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
