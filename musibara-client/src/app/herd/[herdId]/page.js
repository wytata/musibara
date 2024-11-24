"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Tabs, Tab, Button, List, IconButton, Popover, TextField, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PostItem from "@/components/PostItem";
import CardItem from "@/components/CardItem";
import CustomDrawer from "@/components/CustomDrawer";
import SearchBar from "@/components/SearchBar";
import PersonIcon from "@mui/icons-material/Person";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import AlbumIcon from "@mui/icons-material/Album";

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

  const handleSelectResult = (result) => {
    console.log("Selected result for tags:", result);
    setNewPost((prevPost) => ({
      ...prevPost,
      tags: [...prevPost.tags, result],
    }));
  };

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    herdname: herdData.name,
    tags: [],
  });

  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
    console.log("Updated post state:", newPost);
  };

  const handlePostSubmit = () => {
    console.log("Submitting new post:", newPost);
    fetch(apiUrl + `/api/content/posts/new`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPost),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Post submitted successfully!");
        } else {
          console.error("Failed to submit post, status:", response.status);
        }
      })
      .catch((error) => {
        console.error("Error submitting post:", error);
      });
    setIsDrawerOpen(false);
  };

  const handlePlaylistSubmit = () => {
    console.log("Submitting new playlist...");
    setIsPlaylistDrawerOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    console.log("Tab changed to:", newValue);
    setActiveTab(newValue);
  };

  const removeTag = (tagToRemove) => {
    console.log("Removing tag:", tagToRemove);
    setNewPost((prevNewPost) => ({
      ...prevNewPost,
      tags: prevNewPost.tags.filter((tag) => tag !== tagToRemove),
    }));
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
          {herdData.posts && herdData.posts.length > 0 ? (
            <List>
              {herdData.posts.map((post) => (
                <PostItem key={post.postid} post={post} />
              ))}
            </List>
          ) : (
            <Typography>No posts available</Typography>
          )}
        </Box>
      )}

      {/* Playlists Tab */}
      {activeTab === 1 && (
        <Box sx={{ padding: "20px", backgroundColor: "#dde1e6", borderRadius: "15px", display: "flex", gap: 2, flexWrap: "wrap" }}>
          {herdData.playlists && herdData.playlists.length > 0 ? (
            herdData.playlists.map((playlist) => (
              <CardItem key={playlist.playlistid} image={playlist.url} name={playlist.name} />
            ))
          ) : (
            <Typography>No playlists available</Typography>
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
          <Button onClick={handleOpenPostDrawer}>make a post</Button>
          <Button onClick={handleOpenPlaylistDrawer}>add a playlist</Button>
        </Box>
      </Popover>

      {/* Drawer for Post Creation */}
      <CustomDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer}>
        <Typography variant="h6" sx={{ marginBottom: '10px', color: 'grey' }}>Share with the Herd</Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          name="title"
          fullWidth
          variant="standard"
          value={newPost.title}
          onChange={handlePostChange}
        />

        <TextField
          margin="dense"
          label="Content"
          name="content"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          value={newPost.content}
          onChange={handlePostChange}
        />

        <Typography variant="standard" sx={{ color: 'grey', marginBotom: '10px' }}>Add Tags</Typography>

        <SearchBar searchCategory="postTags" onSelectResult={handleSelectResult} />


        {/* Display Tags to be added to post here */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5, fontFamily: 'Cabin', marginTop: '20px' }}>
          {newPost.tags.map((tag, index) => {
            let icon;

            if (tag.tag_type === 'songs') {
              icon = <MusicNoteIcon />;
            } else if (tag.tag_type === 'artists') {
              icon = <PersonIcon />;
            } else if (tag.tag_type === 'albums') {
              icon = <AlbumIcon />;
            }

            return (
              <Chip
                key={index}
                label={`${tag.name || tag.title}`}
                size="small"
                color="primary"
                style={{ background: "#617882", color: "#fff" }}
                onDelete={() => removeTag(tag)}
                icon={icon}
              />
            );
          })}
        </Box>



        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button onClick={handleCloseDrawer}>Cancel</Button>
          <Button onClick={handlePostSubmit} variant="contained" color="primary" sx={{ marginLeft: '10px' }}>Post</Button>
        </Box>
      </CustomDrawer>

      {/* Drawer for Playlist Creation */}
      <CustomDrawer isOpen={isPlaylistDrawerOpen} onClose={handleCloseDrawer}>
        <Typography variant="h6" sx={{ marginBottom: '10px' }}>Add a Playlist</Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Playlist Name"
          name="playlistName"
          fullWidth
          variant="standard"
          onChange={() => { }}
        />
        <TextField
          margin="dense"
          label="Description"
          name="description"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          onChange={() => { }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button onClick={handleCloseDrawer}>Cancel</Button>
          <Button onClick={handlePlaylistSubmit} variant="contained" color="primary" sx={{ marginLeft: '10px' }}>Add Playlist</Button>
        </Box>
      </CustomDrawer>
    </Box>
  );
};

export default Page;