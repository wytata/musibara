'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Container, TextField, Card, CardContent, CardActionArea, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SearchBar = ({ searchCategory = 'postTags' }) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [category, setCategory] = useState('postTags');
    const [songsLength, setSongsLength] = useState(0);
    const [albumsLength, setAlbumsLength] = useState(0);
    const [artistsLength, setArtistsLength] = useState(0);

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleSearchClick = async () => {
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
        if (searchTerm) {
            try {
                let data = [];

                if (category === 'songs') {
                    const response = await fetch(apiUrl + `/api/songs/search`, {
                        credentials: 'include',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ song_name: searchTerm, page_num: null }), // Pass search term in request body
                    });
                    data = await response.json();
                    if (Array.isArray(data)) {
                        setResults(data);
                    } else {
                        console.error('API returned non-array data', data);
                        setResults([]);
                    }
                }

                if (category === 'albums') {
                    const response = await fetch(apiUrl + `/api/albums/search`, {
                        credentials: 'include',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ album_name: searchTerm, page_num: null, artist_name: null }), // Adjust key if needed by your API
                    });
                    data = await response.json();
                    if (data && Array.isArray(data.albums)) {
                        setResults(data.albums); // Use the 'albums' array from the response
                    } else {
                        console.error('API returned non-array data or albums key is missing', data);
                        setResults([]); // Handle error by setting results to an empty array
                    }
                }

                if (category === 'artists') {
                    const response = await fetch(apiUrl + `/api/artists/search`, {
                        credentials: 'include',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({artist_name: searchTerm }),
                    });
                    data = await response.json();
                    if (data && Array.isArray(data.artist-list)) {
                        setResults(data.artist-list); // Use the 'albums' array from the response
                    } else {
                        console.error('API returned non-array data or albums key is missing', data);
                        setResults([]); // Handle error by setting results to an empty array
                    }
                }
                
            } catch (error) {
                console.error('Error fetching search data:', error);
                setResults([]);
            }
        } else {
            setResults([]);
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
                    {searchCategory === "postTags" && (
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
                            <MenuItem value="artists">artists</MenuItem>
                            <MenuItem value="songs">songs</MenuItem>
                            <MenuItem value="albums">albums</MenuItem>
                        </Select>
                    )}
                    
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
                            {results.map((item, index) => (
                                <Card key={index} sx={{ color: '#264653', padding: '4px', width: '35rem'}}>
                                    <CardActionArea>
                                        <CardContent>
                                            {console.log(item)}
                                            {category === "songs" && (
                                                <>
                                                    {item.title} by {item.artist && item.artist.map((artist, i) => (
                                                        <span key={i}>{artist.name}{i < item.artist.length - 1 ? ', ' : ''}</span>
                                                    ))}
                                                </>
                                            )}
                                            {category === "albums" && (
                                                <>
                                                    {item.title} the album by artist(s) {item['artist-credit'] && item['artist-credit'].map((artist, i) => (
                                                        <span key={i}>{artist.name}{i < item['artist-credit'].length - 1 ? ', ' : ''}</span>
                                                    ))}
                                                </>
                                            )}
                                            {category === "artists" && (
                                                <>
                                                    artist {item.name}
                                                </>
                                            )}
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
