"use client";

import React, { useState, useRef } from 'react';
import { Grid, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import CustomDrawer from '@/components/CustomDrawer';

const Page = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [createHerdDrawerOpen, setCreateHerdDrawerOpen] = useState(false);
  const containerRef = useRef(null);

  // Sample herds data
  const [herds, setHerds] = useState({
    topHerds: [
      { id: 1, title: "CAPYROCK", description: "we love rock... fr!", image: "/herd1.jpg", memberCount: 38000, joined: true },
      { id: 2, title: "Capypop", description: "we love pop... fr!", image: "/herd2.jpg", memberCount: 34000, joined: false },
      { id: 3, title: "Capypunk", description: "we love punk... fr!", image: "/herd3.jpg", memberCount: 29000, joined: false },
    ],
    followingHerds: [
      { id: 4, title: "Music Lovers", description: "Sharing music recommendations.", image: "/herd3.jpg", memberCount: 1200, joined: true },
      { id: 5, title: "Art and Creativity", description: "A place for artists to gather.", image: "/herd4.jpg", memberCount: 900, joined: false },
    ]
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden', // Disable scrolling
        height: '100vh', // Set height to full viewport to prevent scrolling
      }}
      ref={containerRef}
    >
      <Grid container direction="column" spacing={3} sx={{ padding: '20px', backgroundColor: '#274c57', minHeight: '100vh' }}>
        {/* Search Bar and Create Herd Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#1d3b44', borderRadius: '25px', padding: '6px 14px' }}>
            <TextField
              placeholder="find your herds"
              variant="standard"
              fullWidth
              InputProps={{
                disableUnderline: true,
                style: { color: 'white' },
              }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <IconButton type="submit" aria-label="search" sx={{ p: '10px', color: '#fff' }}>
              <SearchIcon />
            </IconButton>
            <IconButton
              aria-label="create herd"
              sx={{ p: '10px', color: '#fff' }}
              onClick={() => setCreateHerdDrawerOpen(true)}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Grid>

        {/* Tabs for Top Herds and Herds from Following */}
        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            textColor="inherit"
            TabIndicatorProps={{ sx: { backgroundColor: '#fff' } }}
            sx={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
          >
            <Tab label="top herds" sx={{ color: '#fff', textTransform: 'none' }} />
            <Tab label="herds from following" sx={{ color: '#fff', textTransform: 'none' }} />
          </Tabs>
        </Grid>

        {/* Custom Drawer for Creating a New Herd */}
        <CustomDrawer
          isOpen={createHerdDrawerOpen}
          onClose={() => setCreateHerdDrawerOpen(false)}
          containerRef={containerRef}
        >
          <Typography variant="h6" gutterBottom>Create New Herd</Typography>
          <TextField fullWidth label="Herd Name" margin="normal" />
          <TextField fullWidth label="Description" margin="normal" multiline rows={3} />
          <Button variant="contained" color="primary" fullWidth onClick={() => setCreateHerdDrawerOpen(false)}>
            Create Herd
          </Button>
        </CustomDrawer>

        {/* Herd List */}
        <Grid item xs={12}>
          <CardContent>
            <TabPanel value={activeTab} index={0}>
              <List>
                {herds.topHerds.map((herd, index) => (
                  <Link href={`/herd/${herd.id}`} key={index} passHref>
                    <ListItem
                      component="a"
                      alignItems="center"
                      sx={{ backgroundColor: '#dde1e6', borderRadius: '15px', marginBottom: '15px', padding: '15px', cursor: 'pointer' }}
                    >
                      <Avatar
                        alt={herd.title}
                        src={herd.image}
                        sx={{ width: 80, height: 80, marginRight: '20px' }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                          {herd.title}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                          {herd.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                          {Math.round(herd.memberCount / 1000)}k
                        </Typography>
                      </Box>
                    </ListItem>
                  </Link>
                ))}
              </List>
            </TabPanel>
          </CardContent>
        </Grid>
      </Grid>
    </Box>
  );
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default Page;