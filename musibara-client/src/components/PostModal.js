// components/PostModal.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Typography, IconButton, Box, List, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PostModal = ({ open, handleClose, postid }) => {
    const [post, setPost] = useState(null);

    const posts = [
        {
            postid: 1,
            userid: "djCoolBeats",
            title: "Check out my new track: Chill Vibes",
            content: "I just dropped a new chill track, perfect for those late-night coding sessions! Give it a listen and let me know what you think.",
            likescount: 120,
            numcomments: 2,
            comments: [
                { username: 'musicFan', text: 'Love this track!' },
                { username: 'lofiLover', text: 'Perfect for studying!' }
            ],
            tags: ["chill", "lofi", "electronic"],
        }
    ]

    //fetch data...
    useEffect(() => {
        const postData = posts[0]; // in real app will fetch postbyid
        setPost(postData);
    }, [postid]);

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
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>Posted by @{post.userid}</Typography>
                        <Typography variant="body1" gutterBottom>{post.content}</Typography>

                        {/* Comments Section */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5">Comments</Typography>
                            <List>
                                {post.comments && post.comments.length > 0 ? (
                                    post.comments.map((comment, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={comment.username} secondary={comment.text} />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="textSecondary">No comments yet.</Typography>
                                )}
                            </List>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PostModal;
