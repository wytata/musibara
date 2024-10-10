"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useRouter } from 'next/navigation';
import PostModal from './PostModal';

const PostItem = ({ post }) => {
    const router = useRouter();

    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        console.log("Modal open state changed:", openModal);
    }, [openModal]);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        console.log("CLOSING MODAL");
    };

    return (
        <React.Fragment>
            <Card variant="outlined" sx={{ display: 'flex', mb: 2, cursor: 'pointer', borderRadius: '2rem' }} onClick={handleOpenModal}>
                {/* Likes Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, minWidth: 80 }}>
                    <IconButton>
                        <ArrowUpwardIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ my: 1 }}>
                        {post.likescount}
                    </Typography>
                    <IconButton>
                        <ArrowDownwardIcon />
                    </IconButton>
                </Box>

                {/* Post Content */}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{post.title}</Typography>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Posted by @{post.userid}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                        {post.content}
                    </Typography>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                        {post.tags.map((tag, index) => (
                            <Chip key={index} label={`#${tag}`} size="small" color="primary" />
                        ))}
                    </Box>

                    {/* Comments */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                            {post.numcomments} Comments
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
