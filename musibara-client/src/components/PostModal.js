// components/PostModal.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Typography, IconButton, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import Comment from "./Comment";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PostModal = ({ open, handleClose, postid }) => {
    // const [post, setPost] = useState(null);
    // const [postComments, setPostComments] = useState(null);

    // const fetchPost = async () => {
    //     const postResponse = await fetch(apiUrl + `/api/posts/${postid}`)
    //     const jsonData = await postResponse.json()
    //     setPost(jsonData);
    // }

    // const fetchPostComments = async () => {
    //     const commentsResponse = await fetch(apiUrl + `/api/postcomments/${postid}`)
    //     const jsonData = await commentsResponse.json()
    //     setPostComments(jsonData);
    // }

    // const post1 = [
    //     {
    //         postid: 1,
    //         userid: "djCoolBeats",
    //         title: "Check out my new track: Chill Vibes",
    //         content: "I just dropped a new chill track, perfect for those late-night coding sessions! Give it a listen and let me know what you think.",
    //         likescount: 120,
    //         numcomments: 2,
    //         comments: [
    //             { username: 'musicFan', text: 'Love this track!' },
    //             { username: 'lofiLover', text: 'Perfect for studying!' }
    //         ],
    //         tags: ["chill", "lofi", "electronic"],
    //     }
    // ]

    const post = {
        postid: 1,
        username: "djCoolBeats",
        title: "Check out my new track: Chill Vibes",
        content: "I just dropped a new chill track, perfect for those late-night coding sessions! Give it a listen and let me know what you think.",
        likescount: 120,
        numcomments: 6,
        tags: ["chill", "lofi", "electronic"],
    }

    const postComments = {
        postid: 1,
        comments: [
            {
                commentId: 1,
                username: "user1",
                content: "This is the first comment on the post.",
                likes: 20,
                createdAt: "2024-10-22T14:45:00Z",
                replies: [
                    {
                        commentId: 2,
                        username: "user2",
                        content: "This is a reply to the first comment.",
                        likes: 5,
                        createdAt: "2024-10-22T15:00:00Z",
                        replies: [
                            {
                                commentId: 4,
                                username: "user5",
                                content: "This is a reply to the second comment.",
                                likes: 7,
                                createdAt: "2024-10-22T15:00:00Z",
                                replies: []
                            },
                            {
                                commentId: 5,
                                username: "user6",
                                content: "This is another reply to the second comment.",
                                likes: 8,
                                createdAt: "2024-10-22T15:00:00Z",
                                replies: []
                            }
                        ]
                    },
                    {
                        commentId: 10,
                        username: "user9",
                        content: "This is the second reply to the first comment.",
                        likes: 11,
                        createdAt: "2024-10-22T15:05:00Z",
                        replies: []
                    }
                ]
            },
            {
                commentId: 3,
                username: "user3",
                content: "This is the second comment on the post.",
                likes: 10,
                createdAt: "2024-10-22T15:05:00Z",
                replies: []
            }
        ],
    }

    //fetch data...
    // useEffect(() => {
    //     fetchPost();
    //     fetchPostComments();
    // }, [postid]);

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    bgcolor: '#f7f7f7',
                    width: '80%',
                    height: '80%',
                    maxHeight: '90%',
                    margin: 'auto',
                    borderRadius: '2rem',
                }
            }}
        >
            <DialogContent>
                {/* Close Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Display post content */}
                {post && (
                    <>
                        <Typography variant="h4" gutterBottom>{post.title}</Typography>
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>Posted by @{post.username}</Typography>
                        <Typography variant="body1" gutterBottom>{post.content}</Typography>

                        {/* Tags */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                            {post.tags.map((tag, index) => (
                                <Chip key={index} label={`#${tag}`} size="small" color="primary" />
                            ))}
                        </Box>

                        {/* Comments */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ChatBubbleOutlineIcon fontSize="medium" sx={{ mr: 1 }} />
                            <Typography variant="h5" color="textSecondary">
                                {post.numcomments} Comments
                            </Typography>
                        </Box>

                        {post.numcomments === 0 ? (
                            <div>No comments yet</div>
                        ) : (
                            postComments.comments.map(comment => (
                                <Comment key={comment.commentId} comment={comment} />
                            ))
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PostModal;
