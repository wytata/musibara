"use client";

import React, { useState } from 'react';
import { Box, Typography, Avatar, Tabs, Tab, Button, List } from '@mui/material';
import PostItem from '@/components/PostItem';
import CardItem from '@/components/CardItem'; // Import the CardItem component

const Page = () => {
  const [activeTab, setActiveTab] = useState(0);

  const herdData = {
    title: "Frank Ocean Stans",
    description: "Frank Ocean and friends",
    memberCount: 31200,
    images: ["/frank1.jpg", "/frank2.jpg"],
    joined: true,
    posts: [
      {
        postid: 1,
        userid: "frankoceanfan",
        title: "Quotable, Masterful, Minimal and relatable lyricism",
        content: "Reasons why Frank Ocean is the GOAT",
        likescount: 200,
        numcomments: 50,
        tags: ["lyrical genius"],
      },
      {
        postid: 2,
        userid: "nostalgicfan",
        title: "Unreleased Frank Ocean is best Frank Ocean",
        content: "Ranking unreleased Frank Ocean records #nost",
        likescount: 150,
        numcomments: 30,
        tags: ["nostalgic"],
      }
    ],
    playlists: [
      {
        id: 1,
        name: "Chill Vibes",
        image: "/playlist1.jpg"
      },
      {
        id: 2,
        name: "RnB Classics",
        image: "/playlist2.jpg"
      },
      {
        id: 3,
        name: "Study Beats",
        image: "/playlist3.jpg"
      }
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
          <List>
            {herdData.posts.map((post) => (
              <PostItem key={post.postid} post={post} />
            ))}
          </List>
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ padding: '20px', backgroundColor: '#dde1e6', borderRadius: '15px', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {herdData.playlists.map((playlist) => (
            <CardItem key={playlist.id} image={playlist.image} name={playlist.name} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Page;