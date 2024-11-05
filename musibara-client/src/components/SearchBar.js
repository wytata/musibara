'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Container, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SearchBar = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleSearchClick = async () => {
        if (searchTerm) {
            try {
                const response = await fetch(apiUrl + `/api/songs/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ song_name: searchTerm }), // Pass search term in request body
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    setResults(data); // Set results to the array from the API
                } else {
                    console.error('API returned non-array data', data);
                    setResults([]); // Set empty array if API returns non-array data
                }
            } catch (error) {
                console.error('Error fetching search data:', error);
                setResults([]);
            }
        } else {
            setResults([]); // Clear results if search term is empty
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearchClick(); // Trigger the search when Enter is pressed
        }
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
                    onKeyDown={handleKeyPress}
                />
                    <IconButton
                        type="submit"
                        aria-label="search"
                        sx={{ p: '10px', color: '#fff' }}
                        onClick={handleSearchClick} // Trigger API call on click
                    >
                        <SearchIcon />
                    </IconButton>
                </Box>
                {/* Display search results */}
                {results.length > 0 ? (
                    <Box sx={{ marginTop: 2 }}>
                        {results.map((song, index) => (
                            <Box key={index} sx={{ color: 'white', padding: '4px 0' }}>
                                {song.song_name}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ color: 'white', marginTop: 2 }}>
                        No results found note4wyatt-press enter or search symbol
                    </Box>
                )}

            </Box>
        </Container>
    )
}

export default SearchBar;
