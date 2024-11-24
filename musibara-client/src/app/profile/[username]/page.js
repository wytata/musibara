"use client";

import React, { Suspense, useEffect, useState, useContext } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Grid2, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, CardMedia, CardActionArea } from '@mui/material';
import Link from 'next/link'; // Import Link from next/link
import PostItem from '@/components/PostItem';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImportExport, Widgets, Check, Downloading, Pending } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { exportPlaylistSpotify, exportPlaylistApple } from '@/utilities/export';
import { getUserPlaylistsSpotify, handleAuthCode } from '@/utilities/spotifyServerFunctions';
import { getUserPlaylistsApple } from '@/utilities/appleMusicServerFunctions';
import LinkSpotifyButton from '@/components/LinkSpotify';
import spotifyClient from '@/utilities/spotifyClient';
import Image from 'next/image';
import { importSpotifyPlaylist, importAppleMusicPlaylist } from '@/utilities/import';
import Script from 'next/script';
import { DataContext } from '@/app/layout'; 

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const router = useRouter();
  const { username } = useParams(); // Get username from dynamic route
  const [music, setMusic] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", image: "", songs: "" });
  const [profileData, setProfileData] = useState(null);

  const {
    userData,
    retrieveUserInfo,
    loggedIn,
    userPosts,
    fetchUserPosts,
    playlists,
    setPlaylists,
    retrieveUserPlaylists,
  } = useContext(DataContext);

  const isOwnProfile = loggedIn && userData?.username === username; // Check if the logged-in user matches the profile being viewed

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/byname?username=${username}`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        console.error("Failed to fetch user profile data");
        router.push("/404"); // Redirect to 404 if user doesn't exist
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
    }
  };

  const handleDeletePlaylist = (playlistId) => {
    if (!isOwnProfile) return; // Prevent deletion by non-owners
    fetch(`${apiUrl}/api/playlists/${playlistId}`, {
      method: "DELETE",
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        setPlaylists(playlists.filter((playlist) => playlist.playlistid !== playlistId));
      } else {
        console.error("Failed to delete playlist");
      }
    });
  };

  const handleAddPlaylist = async () => {
    if (!newPlaylist.name) {
      alert("You must provide a name for your new playlist");
      return;
    }

    const formData = new FormData();
    formData.append("playlist_name", newPlaylist.name);
    formData.append("playlist_description", newPlaylist.description);
    newPlaylist.imageFile && formData.append("file", newPlaylist.imageFile);

    const response = await fetch(`${apiUrl}/api/playlists/new`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (response.ok) {
      const addedPlaylist = await response.json();  
      setPlaylists([...playlists, addedPlaylist]);
      setNewPlaylist({ name: "", description: "", image: "" });
      setOpenDialog(false);
    } else {
      console.error("Failed to add playlist:", response.statusText);
    }
  };

  useEffect(() => {
    if (!username) {
      // Redirect to the logged-in user's profile if "/profile" is accessed
      if (userData?.username) {
        router.push(`/profile/${userData.username}`);
      }
      return;
    }
    retrieveUserInfo();
    fetchProfileData();
     if(!isOwnProfile) retrieveUserPlaylists();
    fetchUserPosts();
  }, [username, userData]);

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

  return (
    <Suspense>
      <Grid2 container direction="column" spacing={3} style={{ padding: "20px" }}>
        <Grid2 item xs={12}>
          <Card style={{ borderRadius: "1rem" }}>
            <CardContent style={{ textAlign: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Avatar
                  alt={profileData?.username}
                  src={profileData?.avatar}
                  variant="rounded"
                  sx={{
                    width: "25%",
                    height: "auto",
                    maxHeight: "200px",
                    margin: "0 10px",
                    borderRadius: "1rem",
                  }}
                />
                <Avatar
                  alt={profileData?.name}
                  src={profileData?.banner}
                  variant="rounded"
                  sx={{
                    width: "70%",
                    height: "auto",
                    maxHeight: "200px",
                    margin: "0 10px",
                    borderRadius: "1rem",
                  }}
                />
              </Box>
              <Typography variant="h3" sx={{ marginTop: "10px", fontWeight: "bolder" }}>
                {profileData?.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                @{profileData?.username}
              </Typography>
              <Typography variant="body1" sx={{ marginTop: "10px" }}>
                {profileData?.bio}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 item xs={12}>
          <Card style={{ borderRadius: "1rem" }}>
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{ "& .MuiTabs-indicator": { backgroundColor: "#264653" } }}
              >
                <Tab label="Posts" />
                <Tab label="Playlists" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <List>
                  {userPosts &&
                    userPosts.map((post) => (
                      <PostItem key={post.postid} post={post}>
                        {isOwnProfile && (
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => console.log(`Delete post ${post.postid}`)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </PostItem>
                    ))}
                </List>
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6">Playlists</Typography>
                  {isOwnProfile && (
                    <IconButton onClick={() => setOpenDialog(true)}>
                      <AddIcon />
                    </IconButton>
                  )}
                </Box>
                <List sx={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  {playlists && playlists.map((playlist) => (
                    <ListItem key={playlist.playlistid}>
                      <Card sx={{ borderRadius: "1rem" }}>
                        <CardActionArea>
                          <CardMedia
                            component="img"
                            image={playlist.image_url || "Logo.png"}
                            alt={playlist.name}
                          />
                          <CardContent>
                            <Typography>{playlist.name}</Typography>
                            {isOwnProfile && (
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeletePlaylist(playlist.playlistid)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
              {isOwnProfile && (
                <>
              {userData && userData.spotifyaccesstoken
            ?
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
                          image={playlist.images ? playlist.images[0].url : 'Logo.png'}
                          alt={`Image for playlist ${playlist.name}`}
                        />
                        <CardContent>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-20px', maxWidth: '220px'}}>
                            <p style={{color: '#264653'}}>{playlist.name}</p>
                            {playlist.importStatus != null
                            ?
                              playlist.importStatus
                              ?
                                <Check />
                              :
                                <Pending />
                            :
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
                                <Downloading fontSize="small" />
                              </IconButton>
                            }
                          </div>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
            : ( 
            <TabPanel value={activeTab} index={1}>
                <LinkSpotifyButton/>
            </TabPanel>
            )}
            {userData && userData.applemusictoken
            ?
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
              <List sx={{display: 'flex', flexWrap: 'wrap', gap: '16px', width: '70vw', maxWidth: '100%', alignItems: 'center', borderRadius: '1rem', padding: '0 8px', marginTop: '5px'}}>
                {userData && userData.applePlaylists && userData.applePlaylists.map((playlist) => (
                  <ListItem key={playlist.id} sx={{padding: '0', width: 'fit-content'}}>
                    <Card sx={{borderRadius: '1rem', margin: '0 auto', width: 'fit-content', height: '300px', backgroundColor: '#e6eded', }}>
                      <CardActionArea>
                        <CardMedia
                          component="img"
                          height="140"
                          sx={{borderRadius: '1rem', padding: '5px', margin: '5px', width: '240px', height: '240px'}}
                          image={playlist.attributes.artwork ? playlist.attributes.artwork.url : 'Logo.png'}
                          alt={`Image for playlist ${playlist.attributes.name}`}
                        />
                        <CardContent>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-20px', maxWidth: '220px'}}>
                            <p style={{color: '#264653'}}>{playlist.attributes.name}</p>
                            {playlist.importStatus != null
                            ?
                              playlist.importStatus
                              ?
                                <Check />
                              :
                                <Pending />
                            :
                              <IconButton
                                edge="end"
                                aria-label="import"
                                onClick={async () => {importAppleMusicPlaylist(playlist.id, playlist.attributes.name, userData.applemusictoken);
                                }}
                                sx={{ padding: '5px' , color: '#264653'}}
                              >
                                <Downloading fontSize="small" />
                              </IconButton>
                            }
                          </div>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
            :
            <TabPanel value={activeTab} index={1}>
              <button onClick={linkAppleMusic} type="button" class="text-black bg-white hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center w-1/3 dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 me-2 mb-2">
                <Image className='mr-5' src='https://upload.wikimedia.org/wikipedia/commons/2/2a/Apple_Music_logo.svg' width={30} height={30}/>
                  Connect Apple Music Account
              </button>
            </TabPanel>
            }
            </>
            )}
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Dialog for Adding a New Playlist */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            label="Playlist Name"
            fullWidth
            variant="standard"
            value={newPlaylist.name}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            variant="standard"
            value={newPlaylist.description}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
          />
          <input type="file" accept="image/*" onChange={(e) => setNewPlaylist({ ...newPlaylist, imageFile: e.target.files[0] })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPlaylist}>Add Playlist</Button>
        </DialogActions>
      </Dialog>
    </Suspense>
  );
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default Page;
