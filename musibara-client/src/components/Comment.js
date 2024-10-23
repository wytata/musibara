import React, { useState } from 'react';

const Comment = ({ comment, level = 0 }) => {
    const [showMore, setShowMore] = useState(false);

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    return (
        <div style={{
            marginLeft: level > 0 ? '20px' : '0', border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '2rem',
        }}>
            <div style={{ fontWeight: 'bold' }}>{comment.username}</div>
            <div>{comment.content}</div>
            <div>Likes: {comment.likes}</div>
            <div style={{ fontSize: 'small', color: 'gray' }}>{new Date(comment.createdAt).toLocaleString()}</div>

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