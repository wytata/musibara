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

    useEffect(() => {
        
        const fetchIsLiked = async () => {
            const likedStatus = await getIsLiked(post.postid);
            setIsLiked(likedStatus);
        };
    
        fetchIsLiked(post.postid);
    
    }, []);

    console.log(isLiked);

    const getIsLiked = async (postid) => {
        const isLikedResponse = await fetch(apiUrl + `/api/content/posts/isLiked/${postid}`, {
            include: 'credentials',
        })
        const isLikedJson = await isLikedResponse.json();
        console.log(isLikedJson.isLiked);
        return isLikedJson.isLiked;
    }
    
    const handlePostLikeClick = () => {
        //TODO: connect api to like/unlike posts. maybe need some user information to know who liked what.
        if(isLiked) {
            console.log("unlike post");
            fetch(apiUrl + '/api/content/posts/unlike', {
                method: 'POST',
                include: 'credentials',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    //userid: '1', // TODO: FETCH USER ID FROM SOMEWHERE GLOBAL USING AUTH
                    postid: post.postid,
                })
            })
        }
        else {
            console.log("like post");
            fetch(apiUrl + `/api/content/posts/like`, {
                method: 'POST',
                include: 'credentials',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    //userid: '1', // FETCH USER ID FROM SOMEWHERE GLOBAL USING AUTH
                    postid: post.postid,
                })
            })
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
                        {post.likescount}
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
