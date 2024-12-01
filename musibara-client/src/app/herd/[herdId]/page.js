"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, Box, Typography, Tabs, Tab, Button, List, IconButton, Popover, TextField, ListItem, Card, CardActionArea, CardMedia, CardContent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Link from 'next/link'; // Import Link from next/link
import PostItem from "@/components/PostItem";
import DeleteIcon from '@mui/icons-material/Delete';
import CreatePostDrawer from "@/components/CreatePostDrawer";
import CustomDrawer from "@/components/CustomDrawer";
import { useRouteLoaderData } from "react-router-dom";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", image: "", songs: "" });

  const { herdId } = useParams(); // Get herdId from the URL

  const [herdData, setHerdData] = useState({
    name: "",
    description: "",
    membercount: 0,
    posts: [],
    playlists: [],
  });

  const fetchHerdData = async () => {
    try {
      console.log("Fetching herd data for herdId:", herdId);

      // Fetch posts
      console.log("Fetching posts...");
      const postsResponse = await fetch(`${apiUrl}/api/herds/posts/${herdId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      let posts = [];
      if (postsResponse.ok) {
        posts = await postsResponse.json();
        console.log("Posts fetched successfully:", posts);
      } else {
        console.error("Failed to fetch posts, status:", postsResponse.status);
      }

      // Fetch playlists
      console.log("Fetching playlists...");
      const playlistsResponse = await fetch(`${apiUrl}/api/herds/playlists/${herdId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      let playlists = [];
      if (playlistsResponse.ok) {
        playlists = await playlistsResponse.json();
        console.log("Playlists fetched successfully:", playlists);
      } else {
        console.error("Failed to fetch playlists, status:", playlistsResponse.status);
      }

      // Fetch herd metadata
      console.log("Fetching herd metadata...");
      const metadataResponse = await fetch(`${apiUrl}/api/herds/id/${herdId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      let metadata = {};
      if (metadataResponse.ok) {
        metadata = await metadataResponse.json();
        console.log("Herd metadata fetched successfully:", metadata);
      } else {
        console.error("Failed to fetch herd metadata, status:", metadataResponse.status);
      }

      // Update state with fetched data

      console.log("Is Member? ", metadata.isfollowed)

      setIsMember(metadata.isfollowed)

      setHerdData({
        name: metadata.name || "Unknown Herd",
        description: metadata.description || "No description available.",
        membercount: metadata.membercount || 0,
        imageurl: metadata.imageurl || null,
        posts: Array.isArray(posts) ? posts : [],
        playlists: Array.isArray(playlists) ? playlists : [],
      });
      console.log("Herd data updated:", {
        name: metadata.name,
        description: metadata.description,
        membercount: metadata.membercount,
        posts,
        playlists,
      });
    } catch (error) {
      console.error("Error fetching herd data:", error);

      // Set empty data on failure
      setHerdData({
        name: "Unknown Herd",
        description: "No description available.",
        membercount: 0,
        posts: [],
        playlists: [],
      });
    }
  };

const handleJoinLeaveHerd = async () => {
  try {
    const url = `${apiUrl}/api/herds/${isMember ? 'leave' : 'join'}/${herdId}`;
    console.log("API call: ", url)
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const message = isMember ? "Left the herd successfully" : "Joined the herd successfully";
      console.log(message);
      setIsMember(!isMember);
    } else {
      console.error("Failed to join/leave the herd.", response);
    }
  } catch (error) {
    console.error("Error in join/leave herd action:", error);
  }
};


  useEffect(() => {
    if (herdId) {
      console.log("Running useEffect for herdId:", herdId);
      fetchHerdData();
    } else {
      console.warn("No herdId found in URL params.");
    }
  }, [herdId]);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenPostDrawer = () => {
    setIsDrawerOpen(true);
    handleCloseMenu();
  };

  const handleOpenPlaylistDrawer = () => {
    setIsPlaylistDrawerOpen(true);
    handleCloseMenu();
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setIsPlaylistDrawerOpen(false);
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!loggedIn) return; // Prevent deletion by non-owners
  
    try {
      const response = await fetch(`${apiUrl}/api/playlists/${playlistId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (response.ok) {
        // Update profileData by removing the deleted playlist
        setProfileData((prevProfileData) => ({
          ...prevProfileData,
          playlists: prevProfileData.playlists.filter((playlist) => playlist.playlistid !== playlistId),
        }));
  
        console.log(`Playlist with ID ${playlistId} successfully deleted`);
      } else {
        console.error("Failed to delete playlist:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };
  

  const handleAddPlaylist = async () => {
    if (!newPlaylist.name) {
      alert("You must provide a name for your new playlist");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("playlist_name", newPlaylist.name);
      formData.append("playlist_description", newPlaylist.description);
      formData.append("herd_id", herdId); // Include the herdId from the URL params
      newPlaylist.imageFile && formData.append("file", newPlaylist.imageFile);
  
      const response = await fetch(`${apiUrl}/api/playlists/new`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
  
      if (response.ok) {
        const addedPlaylist = await response.json();
        console.log("Playlist added successfully:", addedPlaylist);
  
        // Update the playlists state with the new playlist
        setHerdData((prevData) => ({
          ...prevData,
          playlists: [...prevData.playlists, addedPlaylist],
        }));
  
        setNewPlaylist({ name: "", description: "", image: "" }); // Reset the form fields
        setIsPlaylistDrawerOpen(false); // Close the drawer
      } else {
        console.error("Failed to add playlist:", response.statusText);
        alert("Failed to add playlist. Please try again.");
      }
    } catch (error) {
      console.error("Error adding playlist:", error);
      alert("An error occurred while adding the playlist. Please try again.");
    }
  };
  
  
  const handlePlaylistSubmit = () => {
    handleAddPlaylist(); // Call the function to add the playlist
  };
  

  const handleTabChange = (event, newValue) => {
    console.log("Tab changed to:", newValue);
    setActiveTab(newValue);
  };


  console.log("Rendered herdData:", herdData);

  return (
    <Box
      ref={containerRef}
      sx={{
        padding: "20px",
        backgroundColor: "#274c57",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
        {herdData.imageurl 
        ?
        <Avatar
          alt={herdData?.name}
          src={herdData?.imageurl}
          variant="rounded"
          sx={{
            width: "25%",
            height: "auto",
            maxHeight: "200px",
            margin: "0 10px",
            borderRadius: "1rem",
          }}
        />
        : null
        }
        <Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", color: "white" }}>
            {herdData.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "white" }}>
            {herdData.description}
          </Typography>
        </Box>
      </Box>

      {/* Join/Leave Button */}
      <Box sx={{ marginTop: "20px", textAlign: "center" }}>
        <Button
          onClick={handleJoinLeaveHerd}
          variant="contained"
          sx={{
            backgroundColor: isMember ? "#d32f2f" : "#264653",
            color: "#fff",
            textTransform: "none",
            fontFamily: "Cabin",
            "&:hover": {
              backgroundColor: isMember ? "#b71c1c" : "#1d3b44",
            },
          }}
        >
          {isMember ? "Leave Herd" : "Join Herd"}
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        textColor="inherit"
        TabIndicatorProps={{ sx: { backgroundColor: "#fff" } }}
        sx={{ marginBottom: "20px" }}
      >
        <Tab label="posts" sx={{ color: "white", textTransform: "none" }} />
        <Tab label="playlists" sx={{ color: "white", textTransform: "none" }} />
      </Tabs>

      {/* Posts Tab */}
      {activeTab === 0 && (
        <Box sx={{ padding: "20px", backgroundColor: "#dde1e6", borderRadius: "15px" }}>
          {Array.isArray(herdData.posts) ? (
            <List>
              {herdData.posts.map((post) => (
                <PostItem key={post.postid} post={post} />
              ))}
            </List>
          ) : (
            console.error("herdData.posts is not an array:", herdData.posts) || <Typography>No posts available</Typography>
          )}
        </Box>
      )}

      {/* Playlists Tab */}
      {activeTab === 1 && (
        <Box sx={{ padding: "20px", backgroundColor: "#dde1e6", borderRadius: "15px", display: "flex", gap: 2, flexWrap: "wrap" }}>
          <List sx={{display: 'flex', flexWrap: 'wrap', gap: '16px', width: '70vw', maxWidth: '100%', alignItems: 'center', borderRadius: '1rem', padding: '0 8px', marginTop: '5px'}}>
                  {herdData && herdData.playlists && herdData.playlists.map((playlist) => (
                    <ListItem key={playlist.playlistid} sx={{padding: '0', width: 'fit-content'}}>
                      <Card sx={{borderRadius: '1rem', margin: '0 auto', width: 'fit-content', height: '300px', backgroundColor: '#e6eded', }}>
                        <CardActionArea>
                        <Link href={`/playlist/${playlist.playlistid}`} passHref>
                        <CardMedia
                          component="img"
                          image={playlist.image_url ? playlist.image_url : "/Logo.png"}
                          height="140"
                          sx={{borderRadius: '1rem', padding: '5px', margin: '5px', width: '240px', height: '240px'}}
                          alt={playlist.name || "Playlist image"}
                        />
                        </Link>
                          <CardContent sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-20px'}} >
                            <Typography>{playlist.name}</Typography>
                            {loggedIn && userData.userid === playlist.userid && (
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeletePlaylist(playlist.playlistid)}
                                sx={{fontSize: 'small' }} // Debug style
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
        </Box>
      )}

       {/* Floating Action Button for Menu */}
       <IconButton
        onClick={handleOpenMenu}
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          backgroundColor: '#264653',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#1d3b44'
          },
          borderRadius: '50%',
          padding: '15px'
        }}
      >
        <AddIcon fontSize="large" />
      </IconButton>

      {/* Popover for Menu Options */}
      <Popover
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
          <Button onClick={handleOpenPostDrawer} sx={{color: '#264653', textTransform: 'none', fontFamily: 'Cabin'}}>make a post</Button>
          <Button onClick={handleOpenPlaylistDrawer} sx={{color: '#264653', textTransform: 'none', fontFamily: 'Cabin'}}>add a playlist</Button>
        </Box>
      </Popover>

      <CreatePostDrawer open={isDrawerOpen} onClose={handleCloseDrawer} herdName={herdData.name}/>

      {/* Drawer for Playlist Creation */}
      <CustomDrawer isOpen={isPlaylistDrawerOpen} onClose={handleCloseDrawer}>
        <Typography variant="h6" sx={{ marginBottom: '10px', color: '#264653', fontFamily: 'Cabin' }}>add a playlist</Typography>
        <TextField
          autoFocus
          margin="dense"
          label="playlist name"
          name="playlistName"
          fullWidth
          variant="standard"
          value={newPlaylist.name} // Bind input to state
          onChange={(e) => setNewPlaylist((prev) => ({ ...prev, name: e.target.value }))} // Update state on input change
          sx={{ fontFamily: 'Cabin' }}
        />
        <TextField
          margin="dense"
          label="description"
          name="description"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          value={newPlaylist.description} // Bind input to state
          onChange={(e) => setNewPlaylist((prev) => ({ ...prev, description: e.target.value }))} // Update state on input change
          sx={{ fontFamily: 'Cabin' }}
        />
        <input
          type="file"
          accept="image/*"
          style={{ marginTop: '10px' }}
          onChange={(e) => setNewPlaylist((prev) => ({ ...prev, imageFile: e.target.files[0] }))} // Update state for image file
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button onClick={handleCloseDrawer} sx={{ color: '#264653', textTransform: 'none', fontFamily: 'Cabin' }}>cancel</Button>
          <Button
            onClick={handlePlaylistSubmit}
            variant="contained"
            color="primary"
            sx={{ marginLeft: '10px', backgroundColor: '#264653', fontFamily: 'Cabin', textTransform: 'none' }}
          >
            add playlist
          </Button>
        </Box>
      </CustomDrawer>
    </Box>
  );
};

export default Page;
