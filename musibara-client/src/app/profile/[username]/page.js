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
import CreatePostDrawer from '@/components/CreatePostDrawer';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const router = useRouter();
  const { username } = useParams(); // Get username from dynamic route
  const [music, setMusic] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", image: "", songs: "" });
  const [profileData, setProfileData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

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

  if(profileData){
    console.log("Username in profile: ", profileData.username)
    console.log("Profile Data outer print ", profileData)
  }

  const isOwnProfile = loggedIn && userData?.username === username; // Check if the logged-in user matches the profile being viewed

  console.log("My profile? ", isOwnProfile)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const retrieveOtherUserPlaylists = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/api/playlists/user/${userId}`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch playlists for user with ID: ${userId}`);
      }
  
      const playlists = await response.json();
      console.log("Other Playlists for user:", playlists);
      return playlists; // Return playlists for further use
    } catch (error) {
      console.error("Error retrieving user playlists:", error);
      return []; // Return an empty array if there's an error
    }
  };
  
  const fetchOtherUserPosts = async (username) => {
    try {
      const response = await fetch(`${apiUrl}/api/content/posts/user/${username}`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch posts for user with username: ${username}`);
      }
  
      const posts = await response.json();
      console.log("Posts for user:", posts);
      return posts; // Return posts for further use
    } catch (error) {
      console.error("Error retrieving user posts:", error);
      return []; // Return an empty array if there's an error
    }
  };

  const fetchProfileData = async () => {
    try {

      console.log(username)

      const response = await fetch(`${apiUrl}/api/users/byname/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Valid by name response")

        const data = await response.json();
        console.log("Response ", data)
        return data;
      } else {
        console.error("Failed to fetch user profile data", response);
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

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenPostDrawer = () => {
    setIsDrawerOpen(true);
    handleCloseMenu();
  };

  const getOtherUser = async () => {
    try {
      const data = await fetchProfileData();
  
      if (data) {
        const [posts, playlists] = await Promise.all([
          fetchOtherUserPosts(data.username),
          retrieveOtherUserPlaylists(data.userid),
        ]);
  
        data.posts = posts || [];
        data.playlists = playlists || [];
  
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching other user's data:", error);
    }
  };

  const getUser = async () => {
    try {
      // Wait for all asynchronous calls to finish
      await retrieveUserInfo()
      await fetchUserPosts()
      const dataplaylists = await retrieveOtherUserPlaylists(userData.userid)

      console.log("Playlist", dataplaylists);  
  
      // Ensure userData is populated before constructing profileData
      if (userData) {
        const data = {
          ...userData,
          posts: userPosts,
          playlists: dataplaylists,
        };
  
        console.log("Fetched Profile Data:", data);
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  
  

  useEffect(() => {

    if (!username && userData?.username) {
      // Redirect to the logged-in user's profile if "/profile" is asccessed
      router.push(`/profile/${userData.username}`);
      return;
    }
    console.log("usedata in useEffect:", userData);
    console.log("=== " , userData?.username === username)
    console.log("== " , userData?.username == username)

  
    if (username && !profileData) {
      if (loggedIn && userData?.username == username) {
        console.log("Fetching own profile data");
        getUser();
      } else {
        console.log("Fetching other user's profile data");
        getOtherUser();
      }
    }
  }, []); // Add userData to dependencies
  //}, [username, loggedIn, userData, playlists, userPosts]); // Add userData to dependencies
  
  

  const handleFollowToggle = async () => {
    try {
      if (profileData.isfollowed) {
        // If already followed, unfollow
        const response = await fetch(`${apiUrl}/api/users/unfollow/${profileData.userid}`, {
          method: "POST",
          credentials: "include",
        });
  
        if (response.ok) {
          console.log(`Unfollowed user: ${profileData.username}`);
          setProfileData((prev) => ({
            ...prev,
            isfollowed: false,
            followercount: prev.followercount - 1,
          }));
        } else {
          console.error("Failed to unfollow the user.");
        }
      } else {
        // If not followed, follow
        const response = await fetch(`${apiUrl}/api/users/follow/${profileData.userid}`, {
          method: "POST",
          credentials: "include",
        });
  
        if (response.ok) {
          console.log(`Followed user: ${profileData.username}`);
          setProfileData((prev) => ({
            ...prev,
            isfollowed: true,
            followercount: prev.followercount + 1,
          }));
        } else {
          console.error("Failed to follow the user.");
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };
  

  return (
    <Suspense>
      <Script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" async/>
      <Grid2 container direction="column" spacing={3} style={{ padding: "20px" }}>
        <Grid2 item xs={12}>
          <Card style={{ borderRadius: "1rem" }}>
          <CardContent style={{ textAlign: 'center', fontFamily: 'Cabin' }}>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Avatar
                  alt={profileData?.username}
                  src={profileData?.profileurl}
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
                  src={profileData?.bannerurl}
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
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h3" style={{ marginTop: '10px', fontFamily: 'Cabin', fontWeight: 'bolder' }}>
                {profileData?.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" style={{fontFamily: 'Cabin'}}>
                @{profileData?.username}
              </Typography>
              <Typography variant="body1" style={{ marginTop: '10px', fontFamily: 'Cabin' }}>
                {profileData?.bio}
              </Typography>
            </Box>
            <Box sx={{ margin: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    herds
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {profileData?.herdcount}
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    followers
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {profileData?.followercount}
                  </Typography>
                </Box>
                <Box style={{ height: '5rem', width: '6rem', margin: '5px', fontFamily: 'Cabin', borderRadius: '1rem', backgroundColor: '#5E767F' }}>
                  <Typography variant="h6" style={{ marginTop: '.5rem', fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                    following
                  </Typography>
                  <Typography variant="h6" style={{ fontFamily: 'Cabin', color: 'white', fontWeight: 'bold' }}>
                      {profileData?.followingcount}
                  </Typography>
                </Box>
                {!isOwnProfile && (
                  <Button
                    onClick={handleFollowToggle}
                    variant={profileData?.isfollowed ? "contained" : "outlined"}
                    sx={{
                      backgroundColor: profileData?.isfollowed ? "#264653" : "transparent",
                      color: profileData?.isfollowed ? "#fff" : "#264653",
                      borderRadius: '15px',
                      marginLeft: '10px',
                    }}
                  >
                    {profileData?.isfollowed ? "Following" : "Follow"}
                  </Button>
                )}
              </Box>
            </Box>
            </CardContent>
            {isOwnProfile && <Button onClick={handleOpenPostDrawer} variant="contained" color="primary" sx={{ fontFamily: 'Cabin', margin: '20px' }}>make a post</Button>}

            <CreatePostDrawer open={isDrawerOpen} onClose={() => { setIsDrawerOpen(false) }} title={"Share with Musibara"} />
            {/* {isOwnProfile && (<Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            >
              <Box sx={{ padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <Button onClick={handleOpenPostDrawer}>make a post</Button>
              </Box>
            </Popover>)} */}
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
                  {profileData && profileData.posts &&
                    profileData.posts.map((post) => (
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
                  {profileData && profileData.playlists && profileData.playlists.map((playlist) => (
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
