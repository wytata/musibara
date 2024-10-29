"use client";

import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton, Container } from '@mui/material';
import { Title } from '@mui/icons-material';

const Page = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    return (
    <Container className="settingsPage" sx={{backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
        <Box className="subcontainer" sx={{backgroundColor: '#ffffff', padding: '20px', minHeight:'100vh', marginTop: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '1rem' }}>
            <Box sx={{color: 'black'}}>
                <h1 style={{ fontSize: '3rem' }}>settings</h1>
            </Box>
            <Box>
                <input
                accept="image/*"
                id="contained-button-file"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                />
                <label htmlFor="contained-button-file">
                    <Button variant="contained" component="span">
                        upload profile image
                    </Button>
                </label>
                {file && <p>selected image: {file.name}</p>}
            </Box>
        </Box>
    </Container>
    );
};

export default Page;