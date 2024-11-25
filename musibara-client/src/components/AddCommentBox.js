import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const AddCommentBox = ({ onSubmit }) => {
  const [comment, setComment] = useState("");

  const handleCancel = () => {
    setComment(""); // Clear the text field
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment); // Call the submit function with the comment
      setComment(""); // Clear the text field after submission
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} marginBottom="20px">
      <TextField
        label="Add a comment"
        variant="outlined"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        fullWidth
      />
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddCommentBox;
