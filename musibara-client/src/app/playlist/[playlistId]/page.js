"use client";

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Avatar, Box, IconButton, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchBar from '@/components/SearchBar';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PlaylistPage = () => {
  const { playlistId } = useParams(); // Get the dynamic id from the URL
  const [open, setOpen] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', album: '', duration: '', views: '' });
  const [playlist, setPlaylist] = useState(null);

  const handleSelectResult = async (result) => {
    try {
        const response = await fetch(`${apiUrl}/api/playlists/${playlistId}/song`, {
            method: "POST",
            credentials: "include", 
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                song_id: result.mbid, // Assuming `mbid` is the unique identifier for the song
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add song to playlist: ${response.statusText}`);
        }



        console.log("Song added to playlist:", result);

        const newSong = {
          name: result.name,
          isrc: result.isrc,
          mbid: result.mbid,
      };

        setPlaylist((playlist) => ({
          ...playlist,
          songs: [...playlist.songs, newSong],
      }));
    } catch (error) {
        console.error("Error adding song to playlist:", error);
    }
  };
  
  const getPlaylistInfo = async () => {
    try {
      // Define the API endpoint
      console.log("Getting Playlist with ID:", playlistId);
      const response = await fetch(`${apiUrl}/api/playlists/${playlistId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies if the API requires authentication
      });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist with ID ${playlistId}: ${response.statusText}`);
      }
  
      // Parse the JSON data from the response
      const playlistData = await response.json();
      setPlaylist(playlistData)
      console.log(playlistData)
  
    } catch (error) {
      console.error("Error fetching playlist information:", error);
      return null; // Return null or handle the error as needed
    }
  };


  // Menu state for export functionality
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    console.log("useEffect begins")
    getPlaylistInfo()
  }, []);


  // Function to handle opening and closing of the add song dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Function to handle export menu opening
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to close export menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Function to add the new song to the playlist
  const handleAddSong = () => {
    playlist.songs.push({ ...newSong});
    handleClose(); // Close the dialog after adding the song
  };

  // Function to delete a song from the playlist
  const handleDeleteSong = (index) => {
    playlist.songs.splice(index, 1); // Remove the song from the array
    setNewSong({ ...newSong }); // Trigger re-render by updating state
  };

  if(!playlist){
    return (<h1> Loading... </h1>);
  }
  return (
    <Box sx={{ padding: '20px' }}>
      {/* Playlist Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <Avatar
          src={playlist.image_url}
          alt={playlist.name}
          sx={{ width: 200, height: 200, marginRight: '20px' }}
        />
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
            {playlist.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white', marginTop: '10px' }}>
            {playlist.description}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'white', marginTop: '5px' }}>
            Duration Placeholder
          </Typography>
        </Box>

        {/* Search Bar for Adding Songs */}
      <SearchBar
        searchCategory="songs"
        onSelectResult={handleSelectResult}
        /*onSongSelect={(song) => addSongToPlaylist(song)} // Callback to add song*/
      />

        {/* Export Playlist Button (Share Icon) */}
        <IconButton
          onClick={handleMenuClick}
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <ShareIcon sx={{ fontSize: 40 }} />
        </IconButton>
        {/* Export Menu */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuClose}>Export to Spotify</MenuItem>
          <MenuItem onClick={handleMenuClose}>Export to Apple Music</MenuItem>
        </Menu>
      </Box>

      {/* Song List */}
      <Card>
        <CardContent>
          <List>
            {playlist.songs.map((song, index) => (
              <ListItem key={index} sx={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
                <Typography variant="h6" sx={{ width: '30px', fontWeight: 'bold', color: '#666' }}>
                  {index + 1}
                </Typography>
                <ListItemText
                  primary={song.name}
                  secondary={song.artist}
                  sx={{ flexGrow: 1, paddingLeft: '20px' }}
                />
                <Typography variant="body2" sx={{ width: '200px', color: '#666' }}>
                  Album Placeholder
                </Typography>
                <Typography variant="body2" sx={{ width: '60px', textAlign: 'right', color: '#666' }}>
                  Duration Placeholder
                </Typography>
                <Typography variant="body2" sx={{ width: '100px', textAlign: 'right', color: '#666' }}>
                  View Placeholder
                </Typography>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteSong(index)}
                  sx={{ color: '#666' }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Dialog for Adding a Song */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add a New Song</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Song Title"
            fullWidth
            variant="standard"
            value={newSong.title}
            onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Artist"
            fullWidth
            variant="standard"
            value={newSong.artist}
            onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Album"
            fullWidth
            variant="standard"
            value={newSong.album}
            onChange={(e) => setNewSong({ ...newSong, album: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Duration (mm:ss)"
            fullWidth
            variant="standard"
            value={newSong.duration}
            onChange={(e) => setNewSong({ ...newSong, duration: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Views"
            fullWidth
            variant="standard"
            value={newSong.views}
            onChange={(e) => setNewSong({ ...newSong, views: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddSong}>Add Song</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlaylistPage;