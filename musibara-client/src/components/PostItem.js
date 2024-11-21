"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostModal from './PostModal';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PostItem = ({ post }) => {

    const [openModal, setOpenModal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likescount);

    useEffect(() => {
        
        const fetchIsLiked = async () => {
            const likedStatus = await getIsLiked(post.postid);
            setIsLiked(likedStatus);
        };
    
        fetchIsLiked(post.postid);
    
    }, []);

    const getIsLiked = async (postid) => {
        const isLikedResponse = await fetch(apiUrl + `/api/content/posts/isLiked/${postid}`, {
            credentials: 'include',
        })
        const isLikedJson = await isLikedResponse.json();
        console.log(isLikedJson.isLiked);
        return isLikedJson.isLiked;
    }
    
    const handlePostLikeClick = async () => {
        const endpoint = isLiked ? '/api/content/posts/unlike' : '/api/content/posts/like';
        const response = await fetch(apiUrl + endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postid: post.postid,
            })
        })

        if(response.ok) {
            const newLikes = isLiked ? likesCount - 1 : likesCount + 1;
            setLikesCount(newLikes);
            setIsLiked(!isLiked);
        }
    }

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    post.tags = ["Hip Hop", "Electronic", "Rock"]; // static data until tag db table is set up and route is updated to return post tags

    return (
        <React.Fragment>
            <Card variant="outlined" sx={{ display: 'flex', mb: 2, cursor: 'pointer', borderRadius: '2rem', fontFamily: 'Cabin', color: '#264653' }} onClick={handleOpenModal}>
                {/* Likes Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2, minWidth: 80,  background: '#e6eded', color: '#264653' }}>
                    <IconButton onClick={(event) => {
                    event.stopPropagation();  // Prevents modal from opening
                    handlePostLikeClick();
                }} >
                        {isLiked ? (<FavoriteIcon />) : (<FavoriteBorderIcon />)}
                    </IconButton>
                    <Typography variant="h6" sx={{ my: 1, fontFamily:'Cabin'}}>
                        {likesCount}
                    </Typography>
                </Box>

                {/* Post Content */}
                <CardContent sx={{ flexGrow: 1, background: '#e6eded' }}>
                    <Typography variant="h6" style={{fontFamily: 'Cabin'}}>{post.title}</Typography>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontFamily: 'Cabin' }}>
                        posted by @{post.username}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 , fontFamily: 'Cabin'}}>
                        {post.content}
                    </Typography>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5, fontFamily:'Cabin'}}>
                        {post.tags.map((tag, index) => (
                            <Chip key={index} label={`#${tag}`} size="small" color="primary" sx={{fontFamily: 'Cabin', background: "#617882"}}/>
                        ))}
                    </Box>

                    {/* Comments */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 1, fontFamily: 'Cabin' }} />
                        <Typography variant="body2" color="textSecondary"  sx={{fontFamily: 'Cabin'}}>
                            {post.numcomments} comments
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <PostModal
                open={openModal}
                handleClose={handleCloseModal}
                postid={post.postid}
            />
        </React.Fragment>
    );
};

export default PostItem;
