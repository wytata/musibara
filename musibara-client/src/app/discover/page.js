"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Grid, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import CustomDrawer from '@/components/CustomDrawer';
import CreateHerdDrawer from '@/components/CreateHerdDrawer';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Page = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [createHerdDrawerOpen, setCreateHerdDrawerOpen] = useState(false);
  const containerRef = useRef(null);
  const [returnData, setReturnData] = useState([]);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  // Sample herds data
  const [herds, setHerds] = useState({
    topHerds: [],
    followingHerds: [],
  });

  const fetchHerds = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/herds/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies if authentication is required
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch herds: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(data);

      // Process and update herds state
      const topHerds = data; // Assuming your backend indicates top herds
      const followingHerds = [];

      setHerds({
        topHerds,
        followingHerds,
      });
    } catch (error) {
      console.error("Error fetching herds:", error);
    }
  };

  useEffect(() => {
    fetchHerds();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const [searchCategory, setSearchCategory] = useState('herds'); 

  const handleCategoryChange = (event) => {
    setSearchCategory(event.target.value);
    setSearchDrawerOpen(false);
  };

  const handleSearchChange = async (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setSearchDrawerOpen(false);
  };

  const handleSearchClick = async () => {
    try {
      let data = [];

      if (searchCategory==='herds') {
        const response = await fetch(apiUrl + `/api/search/herds`, {
          credentials: 'include',
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ search_term: searchTerm }).toString(),
        });
        data = await response.json();
        if (data && Array.isArray(data)) {
          setReturnData(data);
        }
      }
      if (searchCategory==='users') {
        const response = await fetch(apiUrl + `/api/search/users`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ search_term: searchTerm }).toString(),
        });
        data = await response.json();
        if (data && Array.isArray(data)) {
          setReturnData(data);
        }
      }
      if (searchCategory==='posttags') {
        const response = await fetch(apiUrl + `/api/search/tags`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ search_term: searchTerm }).toString(),
        });
        data = await response.json();
        if (data && Array.isArray(data)) {
          setReturnData(data);
        }
      }
      if (searchCategory==='playlists') {
        const response = await fetch(apiUrl + `/api/search/playlists`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ search_term: searchTerm }).toString(),
        });
        data = await response.json();
        if (data && Array.isArray(data)) {
          setReturnData(data);
        }
      }
      setSearchDrawerOpen(true);
    } catch (err) {
      setReturnData([]);
      console.log(err);
    };
    setSearchDrawerOpen(true);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
        handleSearchClick(); // Trigger the search when Enter is pressed
        setSearchDrawerOpen(true);
    }
};

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'auto',
        height: '100vh', // Set height to full viewport to prevent scrolling
        fontFamily: 'Cabin'
      }}
      ref={containerRef}
    >
      <Grid container direction="column" spacing={3} sx={{ padding: '20px', backgroundColor: '#274c57', minHeight: '100vh', fontFamily: 'Cabin' }}>
        {/* Search Bar and Create Herd Button */}
        <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1d3b44',
            borderRadius: '25px',
            padding: '6px 14px',
            fontFamily: 'Cabin'
          }}
        >
          <Select
            value={searchCategory}
            onChange={handleCategoryChange}
            displayEmpty
            sx={{
              color: 'white',
              borderColor: 'white',
              marginRight: '10px',
              '& .MuiSelect-icon': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              fontFamily: 'Cabin'
            }}
            inputProps={{
              style: { color: 'white', padding: '5px' , fontFamily: 'Cabin'},
              
            }}
          >
            <MenuItem value="herds">herds</MenuItem>
            <MenuItem value="users">users</MenuItem>
            <MenuItem value="playlists">playlists</MenuItem>
            <MenuItem value="posttags">post tags</MenuItem>
          </Select>
          <TextField
            placeholder="find your herds"
            variant="standard"
            fullWidth
            InputProps={{
              disableUnderline: true,
              style: { color: 'white', fontFamily: 'Cabin' },
            }}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
          />
          <IconButton
            type="submit"
            aria-label="search"
            sx={{ p: '10px', color: '#fff' }}
            onClick={handleSearchClick}
          >
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
            sx={{ width: '100%', maxWidth: '600px', margin: '0 auto', fontFamily: 'Cabin' }}
          >
            <Tab label="top herds" sx={{ color: '#fff', textTransform: 'none', fontFamily: 'Cabin' }} />
            <Tab label="herds from following" sx={{ color: '#fff', textTransform: 'none', fontFamily: 'Cabin' }} />
          </Tabs>
        </Grid>

        {/* Custom Drawer for Creating a New Herd */}
        <CreateHerdDrawer
          open={createHerdDrawerOpen}
          onClose={() => setCreateHerdDrawerOpen(false)}
        />
        {/*
        <CustomDrawer
          isOpen={createHerdDrawerOpen}
          onClose={() => setCreateHerdDrawerOpen(false)}
          containerRef={containerRef}
        >
          <Typography variant="h6" sx={{color: "#264653", fontFamily: 'Cabin'}}gutterBottom>create a new herd</Typography>
          <TextField fullWidth label="herd name" margin="normal" />
          <TextField fullWidth label="description" margin="normal" multiline rows={3} />
          <Button variant="contained" sx={{textTransform: 'none', backgroundColor: "#264653"}}fullWidth onClick={async () => {
            try {
              const createHerdResponse = await fetch(`${apiUrl}/api/herds/new`, {
                credentials: "include",
                method: "POST",
                body: 
              })
            } catch (err) {
              alert(`Error while trying to create herd: ${err}`)
            }
            setCreateHerdDrawerOpen(false)}
          }>
            create herd
          </Button>
        </CustomDrawer>
        */}


        {/* custom drawer for search results */}
        <CustomDrawer
          isOpen={searchDrawerOpen}
          onClose={() => setSearchDrawerOpen(false)}
          containerRef={containerRef}
          sx = {{overflow: 'scroll', fontFamily: 'Cabin'}}
        >
          {/* if searchCategory === 'herds' display data*/}
          {searchCategory === 'herds' && (
            <div> 
              {returnData.map((herd) => (
                <Link href={`/herd/${herd.herdid}`} key={herd.herdid} passHref>
                <ListItem
                  component="a"
                  alignItems="center"
                  sx={{ backgroundColor: '#dde1e6', borderRadius: '15px', marginBottom: '15px', padding: '15px', cursor: 'pointer', fontFamily: 'Cabin' }}
                >
                  <Avatar
                    alt={herd.name}
                    src={herd.image_url}
                    variant="rounded"
                    sx={{ width: 80, height: 80, marginRight: '20px', borderRadius: '1rem' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontFamily: 'Cabin' }}>
                      {herd.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{fontFamily: 'Cabin'}}>
                      {herd.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555', fontFamily: 'Cabin' }}>
                      {herd.usercount} members
                    </Typography>
                  </Box>
                </ListItem>
              </Link>
              ))}
            </div>
          )}
          {searchCategory === 'users' && (
            <div>
              {returnData.map((user) => (
                <Link href={`/profile/${user.username}`} key={user.username} passHref>
                <ListItem
                  component="a"
                  alignItems="center"
                  sx={{ backgroundColor: '#dde1e6', borderRadius: '15px', marginBottom: '15px', padding: '15px', cursor: 'pointer', fontFamily: 'Cabin' }}
                >
                  <Avatar
                    alt={user.name}
                    src={user.profilephoto || '/Logo.png'}
                    variant="rounded"
                    sx={{ width: 80, height: 80, marginRight: '20px', borderRadius: '1rem' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontFamily: 'Cabin' }}>
                      {user.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{fontFamily: 'Cabin'}}>
                      {user.username}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: 'Cabin' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555', fontFamily: 'Cabin' }}>
                      {user.followercount} followers
                    </Typography>
                  </Box>
                </ListItem>
              </Link>
              ))}
            </div>
          )}
          {searchCategory === 'playlists' && (
            <div>
              {returnData.map((playlist) => (
                <Link href={`/playlist/${playlist.playlistid}`} key={playlist.playlistid} passHref>
                <ListItem
                  component="a"
                  alignItems="center"
                  sx={{ backgroundColor: '#dde1e6', borderRadius: '15px', marginBottom: '15px', padding: '15px', cursor: 'pointer', fontFamily: 'Cabin' }}
                >
                  <Avatar
                    alt={playlist.name}
                    src={playlist.imageid || '/Logo.png'}
                    variant="rounded"
                    sx={{ width: 80, height: 80, marginRight: '20px', borderRadius: '1rem'}}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontFamily: 'Cabin' }}>
                      {playlist.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{fontFamily: 'Cabin'}}>
                      {playlist.description}
                    </Typography>
                  </Box>
                </ListItem>
              </Link>
              ))}
            </div>
          )}
          {searchCategory === 'posttags' && (
            <div>
              {returnData.map((tag) => (
                <Link href={`content/tags/${tag.mbid}`} key={tag.mbid} passHref>
                <ListItem
                  component="a"
                  alignItems="center"
                  sx={{ backgroundColor: '#dde1e6', borderRadius: '15px', marginBottom: '15px', padding: '15px', cursor: 'pointer', fontFamily: 'Cabin' }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontFamily: 'Cabin' }}>
                      {tag.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{fontFamily: 'Cabin'}}>
                      {tag.resourcetype}
                    </Typography>
                  </Box>
                </ListItem>
              </Link>
              ))}
            </div>
          )}
        </CustomDrawer>

        {/* Herd List */}
        <Grid item xs={12}>
          <CardContent>
            <TabPanel value={activeTab} index={0}>
              <List>
                {herds.topHerds.map((herd, index) => (
                  <Link href={`/herd/${herd.herdid}`} key={index} passHref>
                    <ListItem
                      component="a"
                      alignItems="center"
                      sx={{ backgroundColor: '#dde1e6', borderRadius: '15px', marginBottom: '15px', padding: '15px', cursor: 'pointer', fontFamily: 'Cabin' }}
                    >
                      <Avatar
                        alt={herd.name}
                        src={herd.url}
                        variant="rounded"
                        sx={{ width: 80, height: 80, marginRight: '20px', borderRadius: '1rem' }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontFamily: 'Cabin' }}>
                          {herd.name}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary" sx={{fontFamily: 'Cabin'}}>
                          {herd.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: 'Cabin' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555', fontFamily: 'Cabin' }}>
                          {herd.usercount} members
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
      {value === index && <Box sx={{ p: 3, fontFamily: 'Cabin' }}>{children}</Box>}
    </div>
  );
}

export default Page;
