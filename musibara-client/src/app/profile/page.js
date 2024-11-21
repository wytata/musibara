"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, CardMedia, CardActionArea } from '@mui/material';
import Link from 'next/link'; // Import Link from next/link
import PostItem from '@/components/PostItem';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImportExport, Widgets } from '@mui/icons-material';
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
  const [playlists, setPlaylists] = useState([])

  const retrieveUserInfo = async () => {
    try {
      const fetchResponse = await fetch(apiUrl + `/api/users/me`, {
        method: "GET",
        credentials: "include"
      })
      const data = await fetchResponse.json()
      //setUserData(data) 
      if (data.spotifyaccesstoken && data.spotifyrefreshtoken) { 
        console.log("Retrieving Spotify playlists")
        const sPlaylists = await getUserPlaylistsSpotify(data.spotifyaccesstoken, data.spotifyrefreshtoken)
        data.spotifyPlaylists = sPlaylists.playlists
        const access_token = sPlaylists.access_token
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
        console.log("Retrieving Apple playlists")
        const aPlaylists = await getUserPlaylistsApple(data.applemusictoken)
        data.applePlaylists = aPlaylists
      }
      console.log(data)
      setUserData(data)
    } catch (err) {
      console.log("Error retrieving user info")
      console.log(err)
    }
  }

  const currentUser = "jonesjessica"; // TODO: need to change this to be dynamic possibly such as profile/{username} on next.js page

  const [userPosts, setUserPosts] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', image: '', songs: '' });
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
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

  const fetchUserPosts = async () => {
    const postResponse = await fetch(apiUrl + `/api/content/posts/me`, {
      credentials: 'include',
    });

    console.log(postResponse);
    if(postResponse.status == 401) {
      window.location = "/login";
    }

    const jsonData = await postResponse.json()
    setUserPosts(jsonData)
  }

  const retrieveUserPlaylists = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/playlists/`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch Musibara playlists");
      }
  
      const playlists = await response.json();
  
      if (playlists.length === 0) {
        console.log("No Musibara playlists found.");
      } else {
        console.log("Playlists retrieved successfully:", playlists);
        setPlaylists(playlists); // Update the playlists state
      }
    } catch (error) {
      console.error("Error retrieving Musibara playlists:", error);
    }
  };
  

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
        console.log("Error configuring MusicKit")
        console.log(err)
      }
      // MusicKit instance is available
      const kit = MusicKit.getInstance();
      console.log(kit)
      setMusic(kit)
    })
    console.log("Retrieving user info")
    retrieveUserInfo()
    retrieveUserPlaylists()
    if (code) {
      handleAuthCode(code)
    }
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
    if (!code && !access_token) {
     fetchUserPosts(currentUser);
    }
  }, [access_token, currentUser, activeTab]);

  

  const handleDeletePlaylist = (playlistId) => {
    console.log("Deleting playlist with ID:", playlistId);
    fetch(`${apiUrl}/api/playlists/${playlistId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Playlist deleted successfully");
          // Update the playlists state to remove the deleted playlist
          setPlaylists(playlists.filter((playlist) => playlist.playlistid !== playlistId));
        } else {
          console.error("Failed to delete playlist");
        }
      })
    
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

      const response = await fetch(`${apiUrl}/api/playlists/new`, {
        method: "PUT",
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        console.log("Playlist added successfully");
        const addedPlaylist = await response.json();
        console.log(addedPlaylist)
        setPlaylists([...playlists, addedPlaylist]);
        console.log(playlists)
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
        <Card style={{ borderRadius: '1rem' }}>
          <CardContent style={{ textAlign: 'center', fontFamily: 'Cabin' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Avatar
                alt={userData && userData.username}
                src={userData && userData.avatar}
                variant="rounded"
                sx={{ width: '25%', height: 'auto', maxHeight: '200px', marginRight: '0', margin: '0 10px', borderRadius: '1rem' }}
              />
              <Avatar
                alt={userData && userData.name}
                src={userData && userData.banner}
                variant="rounded"
                sx={{ width: '70%', height: 'auto', maxHeight: '200px', margin: '0 10px', borderRadius: '1rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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
              <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    herds
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    {/*# herds*/}15
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    followers
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    {/*# followers*/}14
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    following
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    {/*# following*/}25.2k
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 item xs={12}>
        <Card style={{ borderRadius: '1rem' }}>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ '& .MuiTabs-indicator': { backgroundColor: '#264653' } }}>
              <Tab label="Posts" style={{ fontFamily: 'Cabin', color: '#264653' }} />
              <Tab label="Playlists" style={{ fontFamily: 'Cabin', color: '#264653' }} />
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
                <Typography variant="h6" style={{ fontFamily: 'Cabin' }}>Playlists</Typography>
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
                {userData && playlists && playlists.map((playlist) => (
                  /*<ListItem
                    key={playlist.playlistid}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeletePlaylist(playlist.playlistid)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Link href={`/playlist/${playlist.playlistid}`}>
                      <ListItemText primary={playlist.name} sxsds={{ '& .MuiTypography-root': { fontFamily: 'Cabin'}}}/>
                    </Link>
                  </ListItem>*/
                  <ListItem key={playlist.playlistid} sx={{padding: '0', width: 'fit-content'}}>
                    <Card sx={{borderRadius: '1rem', margin: '0 auto', width: 'fit-content', height: '300px', backgroundColor: '#e6eded', }}>
                      <Link href={`/playlist/${playlist.playlistid}`}>
                        <CardActionArea>
                          <CardMedia
                            component="img"
                            height="140"
                            sx={{borderRadius: '1rem', padding: '5px', margin: '5px', width: '240px', height: '240px'}}
                            image={'Logo.png'}
                            alt={`Image for playlist ${playlist.name}`}
                          />
                          <CardContent>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-20px', maxWidth: '220px'}}>
                              <p style={{color: '#264653'}}>{playlist.name}</p>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={async () => handleDeletePlaylist(playlist.playlistid)}
                                sx={{ padding: '5px' , color: '#264653'}}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </div>
                          </CardContent>
                        </CardActionArea >
                      </Link>
                    </Card>
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
              <List sx={{display: 'flex', flexWrap: 'wrap', gap: '16px', width: '70vw', maxWidth: '100%', alignItems: 'center', borderRadius: '1rem', padding: '0 8px', marginTop: '5px'}}>
                {userData && userData.spotifyPlaylists && userData.spotifyPlaylists.map((playlist) => (
                  <ListItem key={playlist.id} sx={{padding: '0', width: 'fit-content'}}>
                    <Card sx={{borderRadius: '1rem', margin: '0 auto', width: 'fit-content', height: '300px', backgroundColor: '#e6eded', }}>
                      <CardActionArea>
                        <CardMedia
                          component="img"
                          height="140"
                          sx={{borderRadius: '1rem', padding: '5px', margin: '5px', width: '240px', height: '240px'}}
                          image={playlist.images && playlist.images[0].url}
                          alt={`Image for playlist ${playlist.name}`}
                        />
                        <CardContent>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-20px', maxWidth: '220px'}}>
                            <p style={{color: '#264653'}}>{playlist.name}</p>
                            <IconButton
                              edge="end"
                              aria-label="import"
                              onClick={async () => {
                                importSpotifyPlaylist(
                                  playlist.id,
                                  playlist.name,
                                  userData.spotifyaccesstoken,
                                  userData.spotifyrefreshtoken
                                );
                              }}
                              sx={{ padding: '5px' , color: '#264653'}}
                            >
                              <ImportExport fontSize="small" />
                            </IconButton>
                          </div>
                        </CardContent>
                      </CardActionArea>
                    </Card>
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
                  /*<ListItem
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
                  </ListItem>*/
                  <ListItem key={playlist.id} sx={{padding: '0', width: 'fit-content'}}>
                    <Card sx={{borderRadius: '1rem', margin: '0 auto', width: 'fit-content', height: '300px', backgroundColor: '#e6eded', }}>
                      <CardActionArea>
                        <CardMedia
                          component="img"
                          height="140"
                          sx={{borderRadius: '1rem', padding: '5px', margin: '5px', width: '240px', height: '240px'}}
                          image={playlist.attributes.artwork && playlist.attributes.artwork.url}
                          alt={`Image for playlist ${playlist.attributes.name}`}
                        />
                        <CardContent>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-20px', maxWidth: '220px'}}>
                            <p style={{color: '#264653'}}>{playlist.attributes.name}</p>
                            <IconButton
                              edge="end"
                              aria-label="import"
                              onClick={async () => {importAppleMusicPlaylist(playlist.id, playlist.attributes.name, userData.applemusictoken)}}
                              sx={{ padding: '5px' , color: '#264653'}}
                            >
                              <ImportExport fontSize="small" />
                            </IconButton>
                          </div>
                        </CardContent>
                      </CardActionArea>
                    </Card>
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
      sx={{ '& .MuiTypography-root': { fontFamily: 'Cabin, sans-serif' } }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default Page;
