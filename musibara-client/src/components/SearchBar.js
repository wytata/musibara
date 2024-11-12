'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Container, TextField, Card, CardContent, CardActionArea, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SearchBar = () => {

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
                }

                if (category === 'postTags') {
                    const requests = [
                        fetch(apiUrl + `/api/songs/search`, {
                            credentials: 'include',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ song_name: searchTerm, page_num: null }),
                        }),
                        fetch(apiUrl + `/api/albums/search`, {
                            credentials: 'include',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ album_name: searchTerm, page_num: null, artist_name: null }), // Adjust key if needed by your API
                        }),
                        fetch(apiUrl + `/api/artists/search`, {
                            credentials: 'include',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({artist_name: searchTerm }),
                        })
                    ];
    
                    const responses = await Promise.all(requests);
                    const results = await Promise.all(responses.map(response => response.json()));

                    const songs = Array.isArray(results[0]) ? results[0] : [];
                    const albums = Array.isArray(results[1].albums) ? results[1].albums : []
                    const artists = Array.isArray(results[2]['artist-list']) ? results[2]['artist-list'] : [];
                    
                    setSongsLength(songs.length);
                    setAlbumsLength(albums.length);
                    setArtistsLength(artists.length);

                    data = [...songs, ...albums, ...artists];
                }

                if (Array.isArray(data)) {
                    setResults(data);
                } else {
                    console.error('API returned non-array data', data);
                    setResults([]);
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
                            {results.map((item, index) => (
                                <Card key={index} sx={{ color: '#264653', padding: '4px', width: '35rem'}}>
                                    <CardActionArea>
                                        <CardContent>
                                            {console.log(item)}
                                            {index < songsLength ? (
                                                <>
                                                {item.title} by {item.artist && item.artist.map((artist, i) => (
                                                    <span key={i}>{artist.name}{i < item.artist.length - 1 ? ', ' : ''}</span>
                                                ))}
                                                </>
                                            ) : null}
                                            {index >= songsLength && index < songsLength + albumsLength ? (
                                                <>
                                                    {item.title} the album by artist(s) {item['artist-credit'] && item['artist-credit'].map((artist, i) => (
                                                        <span key={i}>{artist.name}{i < item['artist-credit'].length - 1 ? ', ' : ''}</span>
                                                    ))}
                                                </>
                                            ) : null}
                                            {index >= songsLength + albumsLength ? (
                                                <>
                                                    artist {item.name}
                                                </>
                                            ) : null}
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
