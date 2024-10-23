"use client";

import { useParams } from 'next/navigation';
import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Avatar, Box } from '@mui/material';

// Helper function to calculate total duration of playlist in minutes

const calculateTotalDuration = (songs) => {
  return songs.reduce((total, song) => {
    const [minutes, seconds] = song.duration.split(':').map(Number);
    return total + minutes * 60 + seconds;
  }, 0);
};

// Mocked playlist data (you would normally fetch this data from an API or pass it as props)
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
  {
    id: 2,
    name: "Chill Beats",
    image: "/chill-beats.jpg",
    description: "Relaxing vibes for any time of day.",
    songs: [
      { title: "Relaxing Waves", artist: "Ocean Sounds", album: "Nature Sounds", duration: "4:30", views: 15000 },
      { title: "Smooth Jazz", artist: "Jazz Masters", album: "Smooth Jazz Hits", duration: "5:15", views: 10200 },
      { title: "Mellow Guitar", artist: "Acoustic Vibes", album: "Acoustic Chill", duration: "3:40", views: 9400 },
    ],
  },
  {
    id: 3,
    name: "Morning Playlist",
    image: "/morning-playlist.jpg",
    description: "Bright tunes to start your day.",
    songs: [
      { title: "Sunrise Delight", artist: "Morning Tunes", album: "Happy Beats", duration: "3:10", views: 8500 },
      { title: "Morning Breeze", artist: "Fresh Sounds", album: "Nature Collection", duration: "4:20", views: 7800 },
      { title: "Happy Tunes", artist: "Upbeat Vibes", album: "Good Morning Playlist", duration: "3:50", views: 11000 },
    ],
  },
];

const PlaylistPage = () => {
  const { playlistId } = useParams(); // Get the dynamic id from the URL

  // Find the playlist based on the dynamic id
  const playlist = playlists.find((pl) => pl.id === parseInt(playlistId));

  if (!playlist) {
    return <h1>Playlist not found</h1>;
  }

  // Calculate the total duration of the playlist in minutes
  const totalDurationInSeconds = calculateTotalDuration(playlist.songs);

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
            {playlist.songs.length} songs, ~{Math.floor(totalDurationInSeconds/60)} min
          </Typography>
        </Box>
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
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlaylistPage;
