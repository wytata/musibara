"use client";

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, Container} from '@mui/material';
import PostItem from '@/components/PostItem';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const CommentLikes = () => {
  const {postId, commentId } = useParams(); 

    const [userPost, setUserPost] = useState(null);
    const fetchUserPosts = async () => {
        const postResponse = await fetch(apiUrl + `/api/content/posts/${postId}`, {
        credentials: 'include',
        });

        console.log(postResponse);
        if(postResponse.status == 401) {
        window.location = "/login";
        }

        const jsonData = await postResponse.json()
        setUserPost(jsonData)
    }

    useEffect(() => {
        if (postId) {
        fetchUserPosts(); // Fetch posts when postId is available
        }
    }, [postId]);

  return (

    <Container className="commentPage" sx={{backgroundColor: '#264653', minHeight: '100%', margin: 0, padding: 0 }}>
        <PostItem key={userPost.postid} post={userPost} />
    </Container>

  );
}

export default CommentLikes;