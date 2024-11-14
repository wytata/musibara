"use client";

import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Avatar, Box, IconButton, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';

// Helper function to calculate total duration of playlist in minutes
const calculateTotalDuration = (songs) => {
  return songs.reduce((total, song) => {
    const [minutes, seconds] = song.duration.split(':').map(Number);
    return total + minutes * 60 + seconds;
  }, 0);
};

// Mocked playlist data
const playlists = [
  {
    id: 1,
    name: "Coding Vibes",
    image: "/coding-vibes.jpg",
    description: "A playlist full of chill coding beats.",
    songs: [
      { title: "Lo-fi Chill", artist: "Various Artists", album: "Lo-fi Collection", duration: "3:45", views: 12000 },
      { title: "Ambient Beats", artist: "Chillhop", album: "Chillhop Essentials", duration: "2:50", views: 8500 },
      { title: "Code Mode", artist: "Focus Beats", album: "Work Tunes", duration: "4:10", views: 9500 },
    ],
  },
  // Other playlists...
];

const PlaylistPage = () => {
  const { playlistId } = useParams(); // Get the dynamic id from the URL
  const [open, setOpen] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', album: '', duration: '', views: '' });

  // Menu state for export functionality
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Find the playlist based on the dynamic id
  const playlist = playlists.find((pl) => pl.id === parseInt(playlistId));

  if (!playlist) {
    return <h1>Playlist not found</h1>;
  }

  // Calculate the total duration of the playlist in minutes
  const totalDurationInSeconds = calculateTotalDuration(playlist.songs);

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
    playlist.songs.push({ ...newSong, views: parseInt(newSong.views) });
    handleClose(); // Close the dialog after adding the song
  };

  // Function to delete a song from the playlist
  const handleDeleteSong = (index) => {
    playlist.songs.splice(index, 1); // Remove the song from the array
    setNewSong({ ...newSong }); // Trigger re-render by updating state
  };

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Playlist Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <Avatar
          src={playlist.image}
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
            {playlist.songs.length} songs, ~{Math.floor(totalDurationInSeconds / 60)} min
          </Typography>
        </Box>

        {/* Add Song Button (Plus Icon) */}
        <IconButton
          onClick={handleClickOpen}
          sx={{
            marginLeft: 'auto',
            backgroundColor: 'transparent',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <AddIcon sx={{ fontSize: 40 }} />
        </IconButton>

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
                  primary={song.title}
                  secondary={song.artist}
                  sx={{ flexGrow: 1, paddingLeft: '20px' }}
                />
                <Typography variant="body2" sx={{ width: '200px', color: '#666' }}>
                  {song.album}
                </Typography>
                <Typography variant="body2" sx={{ width: '60px', textAlign: 'right', color: '#666' }}>
                  {song.duration}
                </Typography>
                <Typography variant="body2" sx={{ width: '100px', textAlign: 'right', color: '#666' }}>
                  {song.views.toLocaleString()} views
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
