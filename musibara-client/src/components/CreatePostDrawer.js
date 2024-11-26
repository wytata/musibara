import React from "react";
import { useState } from "react";
import CustomDrawer from "./CustomDrawer";
import { Typography, TextField, Box, Button, Chip } from "@mui/material";
import SearchBar from "@/components/SearchBar";
import PersonIcon from "@mui/icons-material/Person";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import AlbumIcon from "@mui/icons-material/Album";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const CreatePostDrawer = ({ open, onClose, herdName = null, title = "share with the herd"}) => {

    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        herdname: herdName,
        tags: [],
    });

    const handlePostChange = (e) => {
        const { name, value } = e.target;
        setNewPost((prevPost) => ({
          ...prevPost,
          [name]: value,
        }));
        console.log("Updated post state:", newPost);
      };
    
      const handlePostSubmit = () => {
        console.log("Submitting new post:", newPost);
        fetch(apiUrl + `/api/content/posts/new`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPost),
        })
          .then((response) => {
            if (response.ok) {
              console.log("Post submitted successfully!");
            } else {
              console.error("Failed to submit post, status:", response.status);
            }
          })
          .catch((error) => {
            console.error("Error submitting post:", error);
          });
        onClose();
      };

      const handleSelectResult = (result) => {
        console.log("Selected result for tags:", result);
        setNewPost((prevPost) => ({
          ...prevPost,
          tags: [...prevPost.tags, result],
        }));
      };

      const removeTag = (tagToRemove) => {
        console.log("Removing tag:", tagToRemove);
        setNewPost((prevNewPost) => ({
          ...prevNewPost,
          tags: prevNewPost.tags.filter((tag) => tag !== tagToRemove),
        }));
      };

    return (
        < CustomDrawer isOpen={open} onClose={onClose} >
            <Typography variant="h6" sx={{ marginBottom: '10px', color: '#264653', fontFamily: 'Cabin' }}>{title}</Typography>
            <TextField
                autoFocus
                margin="dense"
                label="title"
                name="title"
                fullWidth
                variant="standard"
                value={newPost.title}
                onChange={handlePostChange}
                sx={{fontFamily: 'Cabin'}}
            />

            <TextField
                margin="dense"
                label="content"
                name="content"
                fullWidth
                multiline
                rows={4}
                variant="standard"
                value={newPost.content}
                onChange={handlePostChange}
                sx={{fontFamily: 'Cabin'}}
            />

            <Typography variant="standard" sx={{ color: 'grey', marginBotom: '10px', fontFamily: 'Cabin' }}>Add Tags</Typography>

            <SearchBar searchCategory="postTags" onSelectResult={handleSelectResult} />


            {/* Display Tags to be added to post here */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5, fontFamily: 'Cabin', marginTop: '20px' }}>
                {newPost.tags.map((tag, index) => {
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
                            onDelete={() => removeTag(tag)}
                            icon={icon}
                            sx={{fontFamily: 'Cabin'}}
                        />
                    );
                })}
            </Box>



            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <Button onClick={onClose} sx={{textTransform: 'none', color: '264653', fontFamily: 'Cabin'}}>cancel</Button>
                <Button onClick={handlePostSubmit} variant="contained" color="primary" sx={{ marginLeft: '10px', backgroundColor: '#264653', textTransform: 'none' , fontFamily: 'Cabin'}}>post</Button>
            </Box>
        </CustomDrawer >);
}
export default CreatePostDrawer;