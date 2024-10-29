"use client";

import React, { useState } from 'react';
import { Box, Typography, Avatar, Tabs, Tab, Button, List, ListItem, Card, CardContent } from '@mui/material';

const Page = () => {
  const [activeTab, setActiveTab] = useState(0);

  const herdData = {
    title: "Frank Ocean Stans",
    description: "Frank Ocean and friends",
    memberCount: 31200,
    images: ["/frank1.jpg", "/frank2.jpg"],
    joined: true,
    posts: [
      { id: 1, title: "Quotable, Masterful, Minimal and relatable lyricism", content: "Reasons why Frank Ocean is the GOAT", tag: "lyrical genius" },
      { id: 2, title: "Unreleased Frank Ocean is best Frank Ocean", content: "Ranking unreleased Frank Ocean records #nost", tag: "nostalgic" },
    ]
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#274c57', minHeight: '100vh' }}>
      {/* Header with images and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        {herdData.images.map((img, index) => (
          <Avatar key={index} src={img} alt={herdData.title} sx={{ width: 100, height: 100 }} />
        ))}
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
            {herdData.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>
            {herdData.description}
          </Typography>
        </Box>
        <Button
          variant={herdData.joined ? "contained" : "outlined"}
          sx={{
            backgroundColor: herdData.joined ? "#264653" : "transparent",
            color: herdData.joined ? "#fff" : "#264653",
            borderRadius: '15px',
            marginLeft: 'auto'
          }}
        >
          {herdData.joined ? "Joined" : "Join"}
        </Button>
      </Box>

      {/* Tabs for Posts and Playlists */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        textColor="inherit"
        TabIndicatorProps={{ sx: { backgroundColor: '#fff' } }}
        sx={{ marginBottom: '20px' }}
      >
        <Tab label="Posts" sx={{ color: 'white', textTransform: 'none' }} />
        <Tab label="Playlists" sx={{ color: 'white', textTransform: 'none' }} />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{ padding: '20px', backgroundColor: '#dde1e6', borderRadius: '15px' }}>
          {herdData.posts.map((post) => (
            <Card key={post.id} sx={{ marginBottom: '20px', borderRadius: '15px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {post.title}
                </Typography>
                <Typography sx={{ color: '#555', marginTop: '8px' }}>{post.content}</Typography>
                <Button variant="text" sx={{ marginTop: '8px' }}>{post.tag}</Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ padding: '20px', backgroundColor: '#dde1e6', borderRadius: '15px', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#555' }}>No playlists available</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Page;
