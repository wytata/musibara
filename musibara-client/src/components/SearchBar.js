'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Container, TextField, Card, CardContent, CardActionArea, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SearchBar = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [category, setCategory] = useState('postTags');

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#1d3b44', borderRadius: '25px', padding: '6px 14px' }}>
                    <Select
                        value={category}
                        onChange={handleCategoryChange}
                        sx={{
                            marginRight: 2,
                            color: 'white',
                            '.MuiSelect-icon': { color: 'white' }, // Changing dropdown arrow color to white
                            '.MuiOutlinedInput-notchedOutline': { border: 'none' }, // Removing border
                            minWidth: 115,
                        }}
                    >
                        <MenuItem value="postTags">post tags</MenuItem>
                        <MenuItem value="songs">songs</MenuItem>
                    </Select>
                    
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
                <Box>
                    {/* Display search results */}
                    {results.length > 0 ? (
                        <Box sx={{ marginTop: 2, backgroundColor: 'white', borderRadius: '1rem', width: '35rem'}}>
                            {results.map((song, index) => (
                                <Card key={index} sx={{ color: '#264653', padding: '4px', width: '35rem'}}>
                                    <CardActionArea>
                                        <CardContent>
                                        {song.title} by {song.artist.map((artist, i) => (
                                                        <span key={i}>{artist.name}{i < song.artist.length - 1 ? ', ' : ''}</span>
                                                        ))}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ color: 'white', marginTop: 2 }}>
                            no results found
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    )
}

export default SearchBar;
