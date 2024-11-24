"use client";

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, Container , Box} from '@mui/material';
import PostItem from '@/components/PostItem';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PostDisplay = () => {

    const { postid } = useParams();
    console.log(postid)

    const [userPost, setUserPost] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchUserPosts = async () => {
        setIsLoading(true)
        try {
            const postResponse = await fetch(apiUrl + `/api/content/posts/${postid}`, {
                credentials: 'include',
            });

            const jsonData = await postResponse.json()
            console.log(jsonData);
            setUserPost(jsonData);
            setIsLoading(false);
        }
        catch {
            console.error('Error fetching user post:', error);
        }
    }

    useEffect(() => {
        fetchUserPosts(); // Fetch posts when postId is available
        console.log(postid)
    }, [postid]);

    if (isLoading) {
        return <p>Loading...</p>;  // Show loading indicator if still fetching
    }
    return (

        <Container className="commentPage" sx={{ backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
            <Box sx={{borderRadius: '1rem', color: '#264653', margin: '8px', padding: '10px', width: '100%'}}>
                <div className="PostContainer" style={{width: '100%'}}>
                <h1 className='followingTitle' style = {{color: 'white' }}>new posts</h1>
                
                        {userPost ? (
                            <PostItem key={userPost.postid} post={userPost} />
                        ) : (
                            <p>No post found for this ID.</p>
                        )}
                
                </div>
            </Box>
        </Container>

        

    );
}

export default PostDisplay;