import React, { useEffect, useState } from 'react';
import { IconButton, Button, Box } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddCommentBox from './AddCommentBox';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Comment = ({ comment, level = 0 }) => {
    const [showMore, setShowMore] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likescount);
    const [isReplying, setIsReplying] = useState(false);

    const handleReplySubmit = (replyText) => {
        setIsReplying(false); // Close the reply box
        onReply(comment.id, replyText); // Pass the reply up to the parent
    };

    useEffect(() => {
        const fetchIsCommentLiked = async () => {
            const likedStatus = await getIsCommentLiked(comment.commentId);
            setIsLiked(likedStatus);
        };

        fetchIsCommentLiked(comment.commentId);
    }, []);

    const getIsCommentLiked = async (postcommentid) => {
        const isCommentLikedResponse = await fetch(apiUrl + `/api/content/postcomments/isLiked/${postcommentid}`, {
            credentials: 'include',
        })
        const isCommentLikedJson = await isCommentLikedResponse.json();
        console.log(isCommentLikedJson.isLiked);
        return isCommentLikedJson.isLiked;
    }

    const handleLikeClick = async () => {
        const endpoint = isLiked ? '/api/content/postcomments/unlike' : '/api/content/postcomments/like';
        const response = await fetch(apiUrl + endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postcommentid: comment.commentId,
            })
        })

        if (response.ok) {
            const newLikes = isLiked ? likesCount - 1 : likesCount + 1;
            setLikesCount(newLikes);
            setIsLiked(!isLiked);
        }
    }

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    return (
        <div style={{
            marginLeft: level > 0 ? '20px' : '0', border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '2rem',
        }}>
            <div style={{ fontWeight: 'bold' }}>{comment.username}</div>
            <div>{comment.content}</div>
            <div>
                <IconButton onClick={handleLikeClick}>
                    {isLiked ? (<FavoriteIcon />) : (<FavoriteBorderIcon />)}
                </IconButton>
                {likesCount}
            </div>
            <div style={{ fontSize: 'small', color: 'gray' }}>{new Date(comment.createdts).toLocaleString()}</div>

            <Button size="small" onClick={() => setIsReplying(!isReplying)}>
                Reply
            </Button>
            {isReplying && (
                <Box mt={2}>
                    <AddCommentBox onSubmit={handleReplySubmit} />
                </Box>
            )}

            {/* Only show replies up to level 1, collapse beyond that */}
            {comment.replies.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    {comment.replies.slice(0, 1).map(reply => (
                        <Comment key={reply.commentId} comment={reply} level={level + 1} />
                    ))}

                    {/* If there are more than 1 reply, hide the rest unless "Show More" is clicked */}
                    {comment.replies.length > 1 && (
                        <>
                            {showMore ? (
                                comment.replies.slice(1).map(reply => (
                                    <Comment key={reply.commentId} comment={reply} level={level + 1} />
                                ))
                            ) : (
                                <button onClick={toggleShowMore}>Show more replies</button>
                            )}
                        </>
                    )}

                    {/* If the replies are currently shown, provide an option to hide them */}
                    {showMore && <button onClick={toggleShowMore}>Show less replies</button>}
                </div>
            )}
        </div>
    );
};
export default Comment;