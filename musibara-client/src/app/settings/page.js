"use client";

import React, { useState, useEffect, Suspense, useContext} from 'react';
import { Grid, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton, Container, ListItemButton, ListItemIcon, ListItemText, Divider} from '@mui/material';
import { Inbox as InboxIcon, Drafts as DraftsIcon, PhotoCamera } from '@mui/icons-material';
import { DataContext } from '../layout';


const Page = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [bannerPic, setBannerPic] = useState(null);

    const { userData, setUserData, loggedIn, setLoggedIn} = useContext(DataContext);

    const retrieveUserInfo = async () => {
        try {
          const fetchResponse = await fetch(apiUrl + `/api/users/me`, {
            method: "GET",
            credentials: "include"
        })
          const data = await fetchResponse.json() 
          console.log(data)
          setUserData(data)
        } catch (err) {
          console.log("Error retrieving user info")
          console.log(err)
        }
    }

    useEffect(() => {
        retrieveUserInfo();
    }, []);


    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (type === 'profile') {
            setProfilePic(file);
        } else {
            setBannerPic(file);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async() => {
        // Handle save logic (e.g., API call)
        console.log("Saved data:", {userData});

        try {
            const response = await fetch(`${apiUrl}/api/users/settings`, {
                method: "PUT",
                credentials: 'include',
                body: userData,
            });

            console.log(response);

            const pfpResponse = await fetch(`${apiUrl}/api/users/profilepicture`, {
                method: "PUT",
                credentials: 'include',
                body: userData,
            });

            console.log(pfpResponse);

            const bnpResponse = await fetch(`${apiUrl}/api/users/bannerpicture`, {
                method: "PUT",
                credentials: 'include',
                body: userData,
            });

            console.log(bnpResponse);

        } catch (error) {
            console.error("Error adding playlist:", error);
          }
    };

    return (
    <Suspense>
    <Container className="settingsPage" sx={{backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
            <Container maxWidth="lg" sx={{ py: 2.5 }}>
                <Box sx={{ backgroundColor: '#ffffff', p: 3, borderRadius: '1rem', boxShadow: 2 , color: 'black'}}>
                    <h1 style={{ fontSize: '3rem' }}>settings</h1>
                    <Divider sx={{ my: 2 }} />

                    {/* Banner Picture Upload */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <input
                            accept="image/*"
                            id="banner-upload"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, 'banner')}
                        />
                        <label htmlFor="banner-upload">
                            <Button
                                variant="contained"
                                color="primary"
                                component="span"
                                startIcon={<PhotoCamera />}
                                sx={{ mb: 2, 
                                    '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                                    '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                                    textTransform: 'none', 
                                    color: '#fffff',
                                    backgroundColor: '#264653',
                                    '&:hover': {backgroundColor: '#92a2a9'}
                                }}
                            >
                            <Avatar
                                alt={userData && userData.name}
                                src={userData && userData.bannerphotourl}
                                variant="rounded"
                                sx={{ width: '71%', height: '250px', margin: '0 10px', borderRadius: '1rem' }}
                            />
                                upload profile banner
                            </Button>
                        </label>
                        {bannerPic && <Typography variant="caption" display="block">selected banner: {bannerPic.name}</Typography>}
                    </Box>

                    {/* Profile Picture Upload */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                            src={userData && userData.profilephotourl}
                            alt="Profile Picture"
                            sx={{ width: 80, height: 80, mr: 2 }}
                        />
                        <input
                            accept="image/*"
                            id="profile-upload"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileChange(e, 'profile')}
                        />
                        <label htmlFor="profile-upload">
                            <IconButton color="primary" aria-label="upload profile picture" component="span">
                                <PhotoCamera sx={{ color: '#264653' }}/>
                            </IconButton>
                        </label>
                        {profilePic && <Typography variant="caption">selected pfp: {profilePic.name}</Typography>}
                    </Box>

                    {/* Form Fields */}
                    <TextField
                        fullWidth
                        label="name"
                        name="name"
                        variant="outlined"
                        value={"Hi"}
                        onChange={handleChange}
                        sx={{ mb: 2, 
                            '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                            '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                            '&.Mui-focused fieldset': { borderColor: '#264653'}
                        }}
                    />
                    <TextField
                        fullWidth
                        label="username"
                        name="username"
                        variant="outlined"
                        value={userData.username}
                        onChange={handleChange}
                        sx={{ mb: 2, 
                            '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                            '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                            '&.Mui-focused fieldset': { borderColor: '#264653'} 
                        }}
                    />
                    <TextField
                        fullWidth
                        label="bio"
                        name="bio"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={userData.bio}
                        onChange={handleChange}
                        sx={{ mb: 2, 
                            '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                            '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                            '&.Mui-focused fieldset': { borderColor: '#264653'}
                        }}
                    />
                    <TextField
                        fullWidth
                        label="email"
                        name="email"
                        variant="outlined"
                        type="email"
                        value={userData.email}
                        onChange={handleChange}
                        sx={{ mb: 2, 
                            '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                            '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                            '&.Mui-focused fieldset': { borderColor: '#264653'}
                        }}
                    />
                    <TextField
                        fullWidth
                        label="phone number"
                        name="phoneNumber"
                        variant="outlined"
                        type="tel"
                        value={userData.phoneNumber}
                        onChange={handleChange}
                        sx={{ mb: 2, 
                            '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                            '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                            '&.Mui-focused fieldset': { borderColor: '#264653'} 
                        }}
                    />
                    <TextField
                        fullWidth
                        label="password"
                        name="password"
                        variant="outlined"
                        type="password"
                        value={userData.password}
                        onChange={handleChange}
                        sx={{ mb: 2, 
                            '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                            '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                            '&.Mui-focused fieldset': { borderColor: '#264653'}
                        }}
                    />

                    {/* Save Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        sx={{ mb: 2, 
                            '& .MuiInputBase-input': { fontFamily: 'Cabin' },
                            '& .MuiInputLabel-root': { fontFamily: 'Cabin' },
                            textTransform: 'none', 
                            color: '#fffff',
                            backgroundColor: '#264653',
                            '&:hover': {backgroundColor: '#92a2a9'}
                        }}
                    >
                        save changes
                    </Button>
                </Box>
            </Container>
    </Container>
    </Suspense>
    );
};

export default Page;