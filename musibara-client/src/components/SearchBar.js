'use client';

import { useState } from 'react';
import { Box, Drawer, IconButton, Container, Grid, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {

    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    return (
        <Container>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#1d3b44', borderRadius: '25px', padding: '6px 14px' }}>
                <TextField
                    placeholder="search music"
                    variant="standard"
                    fullWidth
                    InputProps={{
                    disableUnderline: true,
                    style: { color: 'white' }, // Changing text color to white
                    }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <IconButton type="submit" aria-label="search" sx={{ p: '10px', color: '#fff' }}><SearchIcon /></IconButton>
                </Box>
            </Box>
        </Container>
    )
}

export default SearchBar;
