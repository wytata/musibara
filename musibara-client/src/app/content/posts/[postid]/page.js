"use client";

import { useParams } from 'next/navigation';
import PostItem from '@/components/PostItem';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Typography, IconButton, Box, List, ListItem, ListItemText, Chip , Container} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import Comment from "@/components/Comment";
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AlbumIcon from '@mui/icons-material/Album';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PostDisplay = () => {

    const { postid } = useParams();

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const fetchUserPosts = async () => {
        setIsLoading(true)
        try {
            const postResponse = await fetch(apiUrl + `/api/content/posts/${postid}`, {
                credentials: 'include',
            });

            const jsonData = await postResponse.json()
            console.log(jsonData);
            setPost(jsonData);
            setIsLiked(jsonData.isliked);
            setLikesCount(jsonData.likescount)
            setIsLoading(false);
        }
        catch (error) {
            console.error('Error fetching user post:', error);
        }
    }

    const [postComments, setPostComments] = useState(null);
    const fetchPostComments = async () => {
        const commentsResponse = await fetch(apiUrl + `/api/content/postcomments/${postid}`)
        const jsonData = await commentsResponse.json();
        setPostComments(jsonData);
    }


    const handlePostLikeClick = async () => {
        const endpoint = isLiked ? '/api/content/posts/unlike' : '/api/content/posts/like';
        try{
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

            if (response.ok) {
                const newLikes = isLiked ? likesCount - 1 : likesCount + 1;
                setLikesCount(newLikes);
                setIsLiked(!isLiked);
            }
        }
        catch (error) {
            console.error('Error liking post: ', error);
        }
    }

    useEffect(() => {
        fetchUserPosts(); // Fetch posts when postId is available
        fetchPostComments();
    }, [postid]);


    


    if (isLoading) {
        return <p>Loading...</p>;  // Show loading indicator if still fetching
    }
    console.log(post)
    return (

        <Container className="PostDisplay" sx={{ backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
            <Box sx={{borderRadius: '1rem', color: '#264653', margin: '8px', padding: '10px', width: '100%'}}>
                <div className="PostContainer" style={{width: '100%'}}>
                
                        {/* {userPost ? (
                            <PostItem key={userPost.postid} post={userPost} />
                        ) : (
                            <p>No post found for this ID.</p>
                        )} */}
                    {post ? (
                        <div className="postPage" sx={{ backgroundColor: '#f7f7f7', padding: '20px' }}>
                            {/* Content */}
                            <Typography variant="h4" gutterBottom style={{ fontFamily: 'Cabin' }}>{post.title}</Typography>
                            <Typography variant="subtitle1" color="textSecondary" gutterBottom style={{ fontFamily: 'Cabin' }}>posted by @{post.username}</Typography>
                            <Typography variant="body1" gutterBottom style={{ fontFamily: 'Cabin' }}>{post.content}</Typography>

                            {/* Likes Section */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2, minWidth: 80, background: '#e6eded', color: '#264653' }}>
                                <IconButton onClick={(event) => {
                                    event.stopPropagation();  // Prevents modal from opening
                                    handlePostLikeClick();
                                }} >
                                    {isLiked ? (<FavoriteIcon />) : (<FavoriteBorderIcon />)}
                                </IconButton>
                                <Typography variant="h6" sx={{ my: 1, fontFamily: 'Cabin' }}>
                                    {likesCount}
                                </Typography>
                            </Box>

                            
                            {/* Tags */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5, fontFamily: 'Cabin' }}>
                                {post.tags.map((tag, index) => {
                                    let icon;

                                    if (tag.tag_type === 'songs') {
                                        icon = <MusicNoteIcon />;
                                    } else if (tag.tag_type === 'artists') {
                                        icon = <PersonIcon />;
                                    } else if (tag.tag_type === 'albums') {
                                        icon = <AlbumIcon />;
                                    }

                                    return (
                                        <Chip
                                            key={index}
                                            label={`${tag.name || tag.title}`}
                                            size="small"
                                            color="primary"
                                            style={{ background: "#617882", color: "#fff" }}
                                            icon={icon}
                                        />
                                    );
                                })}
                            </Box>

                            {/* Comments */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ChatBubbleOutlineIcon fontSize="medium" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="textSecondary" style={{ fontFamily: 'Cabin' }}>
                                    {post.numcomments} comments
                                </Typography>
                            </Box>

                            {post.numcomments === 0 || !postComments ? (
                                <div>No comments yet</div>
                            ) : (
                                postComments.comments.map(comment => (
                                    <Comment key={comment.commentId} comment={comment} />
                                ))
                            )}
                        </div>
                    ) : (
                        <p>No post found for this ID.</p>
                    )}

                
                </div>
            </Box>
        </Container>

        

    );
}

export default PostDisplay;