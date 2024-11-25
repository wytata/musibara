'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Container, TextField, Card, CardContent, CardActionArea, Select, MenuItem, Modal, Typography, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Image from 'next/image';
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
    const [imageUrls, setImageUrls] = useState([])
    const [category, setCategory] = useState('songs');
    const [songsLength, setSongsLength] = useState(0);
    const [albumsLength, setAlbumsLength] = useState(0);
    const [artistsLength, setArtistsLength] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0); // Store number of search results 
    const [currentPage, setCurrentPage] = useState(1); // Store current page 

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handlePageChange = (newPage) => {
        handleSearchClick(category, searchTerm, newPage);
    }

    const handleSearchClick = async (currentCategory = category, term = searchTerm, page = currentPage) => {
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
                        body: JSON.stringify({ song_name: term, page_num: page }), // Pass search term in request body
                    });
                    data = await response.json();
                    if (Array.isArray(data.data)) {
                        setResults(data.data);
                        setTotalCount(data.count);
                        setCurrentPage(page);

                        const image_urls = await Promise.all(data.data.map(async (item) => {
                            let release_id = item.releases ? item.releases[0] : null
                            if (release_id) {
                                try {
                                    const cover_art_result = await fetch(`https://coverartarchive.org/release/${release_id}`)
                                    if (cover_art_result.ok) {
                                        const coverArtData = await cover_art_result.json()
                                        return coverArtData.images[0].image
                                    } else {
                                        return "https://static.vecteezy.com/system/resources/previews/024/275/544/non_2x/music-note-icon-in-black-color-vector.jpg"
                                    }
                                } catch (err) {
                                    console.log(err)
                                }
                            } else {
                                return "https://static.vecteezy.com/system/resources/previews/024/275/544/non_2x/music-note-icon-in-black-color-vector.jpg"
                            }
                        }))
                        setImageUrls(image_urls)
                        setModalOpen(true);
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
                        body: JSON.stringify({ album_name: term, page_num: page, artist_name: null }), // Adjust key if needed by your API
                    });
                    data = await response.json();
                    if (data && Array.isArray(data.albums)) {
                        setResults(data.albums);
                        setTotalCount(data.count);
                        setCurrentPage(page);
                        /* IMAGE URLS PERHAPS */
                        setModalOpen(true);

                    } else {
                        console.error('API returned non-array data or albums key is missing', data);
                        setResults([]);
                    }
                }

                if (category === 'artists') {
                    const response = await fetch(apiUrl + `/api/artists/search`, {
                        credentials: 'include',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({artist_name: term, page_num: page }),
                    });
                    data = await response.json();
                    if (data && Array.isArray(data["artist-list"])) {
                        setResults(data["artist-list"]);
                        setTotalCount(data.count);
                        setCurrentPage(page);
                        /* IMAGE URLS PERHAPS */
                        setModalOpen(true);

                    } else {
                        console.error('API returned non-array data or artist key is missing', data);
                        setResults([]);
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
                        "mbid": result.mbid,
                        "isrc": result['isrc-list'] && result['isrc-list'][0],
                        "title": result.title,
                        "artist": result.artist.map(artist => ({
                            "name": artist.name,  
                            "id": artist.id,     
                        })),
                        "release_list": result.release_list || [],
                    }),
                });
                if (!response.ok) {
                    console.log("song not saved successfully");
                }
            } catch (error) {
                console.error("error saving song: ", error);
            } 
        }
        if (category === 'albums') {
            try {
                const response = await fetch(apiUrl + '/api/albums/save' , {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type' : 'application/json',
                    },
                    body: JSON.stringify({
                        mbid: result.id,  //might be wrong
                        name: result.title,
                    }),
                });
                if (!response.ok) {
                    console.log("album not saved successfully");
                }
            } catch (error) {
                console.error("error saving album: ", error);
            } 
        }
        if (category === 'artists') {
            try {
                const response = await fetch(apiUrl + '/api/artists/save' , {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type' : 'application/json',
                    },
                    body: JSON.stringify({
                        mbid: result.id,  //might be wrong
                        name: result.name,
                    }),
                });
                if (!response.ok) {
                    console.log("album not saved successfully");
                }
            } catch (error) {
                console.error("error saving album: ", error);
            } 
        }
    };

    const handleResultClick = async (result) => {
        // saves the result to the parent and saves information to the database
        await saveResult(result);
        if (onSelectResult) {
            const newResult = {...result, tag_type: category };
            onSelectResult(newResult);
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
                        style: { color: 'white' },
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
                </Box>
                <Modal open={modalOpen} onClose={handleCloseModal} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Box
                        sx={{
                            backgroundColor: 'white',
                            width: '50%',
                            maxHeight: '80%',
                            overflowY: 'auto',
                            borderRadius: '1rem',
                            padding: 2,
                            boxShadow: 24,
                        }}
                    >
                        <Typography variant="h6" style={{ fontFamily: 'Cabin', color: '#264653', fontWeight: 'bold', marginBottom: 1}}>search results</Typography>
                        {results.length > 0 ? (
                            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>                                
                            {results.map((item, index) => (
                                    <Card key={index} sx={{ color: '#264653', margin: 1, borderRadius: '1rem', backgroundColor: '#e6eded', display: 'flex', alignItems: 'center' }}>
                                        {typeof(imageUrls[index]) == 'string'
                                        ?   <img src={imageUrls[index]} alt='hi' style={{width: 'auto', height: '50px', borderRadius: '.5rem', margin: '5px'}}/>
                                        :  category != "artists" 
                                        ?    <img src={"https://static.vecteezy.com/system/resources/previews/024/275/544/non_2x/music-note-icon-in-black-color-vector.jpg"} alt='hi' sx={{width: 'auto', height: '50px', borderRadius: '.5rem', margin: '5px'}} />
                                        : null
                                        }
                                        <CardActionArea onClick={async () => await handleResultClick(item)}>
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
                                <Pagination
                                    count = {Math.ceil(totalCount / 25)}
                                    page = {currentPage}
                                    onChange={(e, page) => handlePageChange(page)}
                                />
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
