'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Container, TextField, Card, CardContent, CardActionArea, Select, MenuItem, Modal } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/*NOTES FOR HOW TO CALL AND USE THE SELECTED RESULT

INCLUDE THE FOLLOWING FUNCTIONS IN PARENT: 

const [selectedResult, setSelectedResult] = useState(null);

const handleSelectResult = (result) => {
    setSelectedResult(result)
};

HOW TO CALL (2 options):
TO ADD TO POSTS: <SearchBar searchCategory="postTags" onSelectResult={handleSelectResult} />
TO ADD TO PLAYLISTS: <SearchBar searchCategory="songs" onSelectResult={handleSelectResult} />

KEEP IN MIND: RESULT MAY BE IN JSON

*/

const SearchBar = ({ searchCategory = 'postTags', onSelectResult }) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [category, setCategory] = useState('songs');
    const [songsLength, setSongsLength] = useState(0);
    const [albumsLength, setAlbumsLength] = useState(0);
    const [artistsLength, setArtistsLength] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
        handleSearchClick();
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
                    if (Array.isArray(data)) {
                        setResults(data);
                    } else {
                        console.error('API returned non-array data', data);
                        setResults([]);
                    }
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
                    if (data && Array.isArray(data["artist-list"])) {
                        setResults(data["artist-list"]); // Use the 'albums' array from the response
                    } else {
                        console.error('API returned non-array data or albums key is missing', data);
                        setResults([]); // Handle error by setting results to an empty array
                    }
                }
                if (data.length > 0) {  // display results
                    setModalOpen(true);
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

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const saveResult = async (result) => {
        if (category === 'songs') {
            try {
                const response = await fetch(apiUrl + '/api/songs/save' , {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type' : 'application/json',
                    },
                    body: JSON.stringify({
                        mbid: result.mbid,
                        isrc: result['isrc-list'] && result['isrc-list'][0],
                        title: result.title,
                        artist: result.artist.map(artist => ({
                            name: artist.name,  
                            id: artist.id,     
                        })),
                        release_list: result.release_list || [],
                    }),
                });
                if (!response.ok) {
                    console.log("song not saved successfully");
                }
            } catch (error) {
                console.error("error saving song: ", error);
            } 
        }
    };

    const handleResultClick = (result) => {
        // saves the result to the parent and saves information to the database
        saveResult(result);
        if (onSelectResult) {
            onSelectResult(result);
        }
        handleCloseModal();
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
                <Modal open={modalOpen} onClose={handleCloseModal} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Box
                        sx={{
                            backgroundColor: '#e6eded',
                            width: '50%',
                            maxHeight: '80%',
                            overflowY: 'auto',
                            borderRadius: '1rem',
                            padding: 2,
                            boxShadow: 24,
                        }}
                    >
                        <Typography variant="h6" style={{ fontFamily: 'Cabin', color: '#264653', fontWeight: 'bold' }}>search results</Typography>
                        {results.length > 0 ? (
                            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>                                
                            {results.map((item, index) => (
                                    <Card key={index} sx={{ color: '#264653', marginBottom: 2, borderRadius: '1rem'}}>
                                        <CardActionArea onClick={() => handleResultClick(item)}>
                                            <CardContent>
                                                {category === "songs" && (
                                                    <>
                                                        {item.title} by {item.artist && item.artist.map((artist, i) => (
                                                            <span key={i}>{artist.name}{i < item.artist.length - 1 ? ', ' : ''}</span>
                                                        ))}
                                                    </>
                                                )}
                                                {category === "albums" && (
                                                    <>
                                                        {item.title} by artist(s) {item['artist-credit'] && item['artist-credit'].map((artist, i) => (
                                                            <span key={i}>{artist.name}{i < item['artist-credit'].length - 1 ? ', ' : ''}</span>
                                                        ))}
                                                    </>
                                                )}
                                                {category === "artists" && (
                                                    <>
                                                        {item.name}
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
                </Modal>
            </Box>
        </Container>
    )
}

export default SearchBar;
