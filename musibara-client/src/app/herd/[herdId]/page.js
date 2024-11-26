"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, Box, Typography, Tabs, Tab, Button, List, IconButton, Popover, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PostItem from "@/components/PostItem";
import CardItem from "@/components/CardItem";
import CreatePostDrawer from "@/components/CreatePostDrawer";
import CustomDrawer from "@/components/CustomDrawer";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
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
          {Array.isArray(herdData.playlists) ? (
            herdData.playlists.map((playlist) => (
              <CardItem key={playlist.playlistid} image={playlist.url} name={playlist.name} />
            ))
          ) : (
            console.error("herdData.playlists is not an array:", herdData.playlists) || <Typography>No playlists available</Typography>
          )}
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
          onChange={() => { }}
          sx={{fontFamily: 'Cabin'}}
        />
        <TextField
          margin="dense"
          label="description"
          name="description"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          onChange={() => { }}
          sx={{fontFamily: 'Cabin'}}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button onClick={handleCloseDrawer} sx={{color: '#264653', textTransform: 'none', fontFamily: 'Cabin'}}>cancel</Button>
          <Button onClick={handlePlaylistSubmit} variant="contained" color="primary" sx={{ marginLeft: '10px', backgroundColor: '#264653', fontFamily: 'Cabin' , textTransform: 'none'}}>add playlist</Button>
        </Box>
      </CustomDrawer>
    </Box>
  );
};

export default Page;
