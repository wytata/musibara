// components/PostModal.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Typography, IconButton, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import Comment from "./Comment";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PostModal = ({ open, handleClose, postid }) => {
    const [post, setPost] = useState(null);
    const [postComments, setPostComments] = useState(null);

    const fetchPost = async () => {
        const postResponse = await fetch(apiUrl + `/api/content/posts/${postid}`)
        const jsonData = await postResponse.json()
        jsonData.tags = ["Hip Hop", "Electronic", "Rock"]; //hardcoded because api route does not return tags since tags table not set up yet
        setPost(jsonData);
    }

    const fetchPostComments = async () => {
        const commentsResponse = await fetch(apiUrl + `/api/content/postcomments/${postid}`)
        const jsonData = await commentsResponse.json();
        setPostComments(jsonData);
    }

    useEffect(() => {
        fetchPost();
        fetchPostComments();
    }, [postid, open]);

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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Display post content */}
                {post && (
                    <>
                        <Typography variant="h4" gutterBottom style={{fontFamily: 'Cabin'}}>{post.title}</Typography>
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom style={{fontFamily: 'Cabin'}}>posted by @{post.username}</Typography>
                        <Typography variant="body1" gutterBottom style={{fontFamily: 'Cabin'}}>{post.content}</Typography>

                        {/* Tags */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5, fontFamily:'Cabin'}}>
                            {post.tags.map((tag, index) => (
                                <Chip key={index} label={`#${tag}`} size="small" color="primary" style={{background: "#617882"}} />
                            ))}
                        </Box>

                        {/* Comments */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ChatBubbleOutlineIcon fontSize="medium" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="textSecondary" style={{fontFamily: 'Cabin'}}>
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PostModal;
