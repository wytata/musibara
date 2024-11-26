import React from "react";
import { useState } from "react";
import CustomDrawer from "./CustomDrawer";
import { Chip, Card, CardContent, Typography, Avatar, Tabs, Tab, Box, List, ListItem, TextField, Button, IconButton, Container, ListItemButton, ListItemIcon, ListItemText, Divider} from '@mui/material';
import { Inbox as InboxIcon, Drafts as DraftsIcon, PhotoCamera, Delete } from '@mui/icons-material';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const CreateHerdDrawer = ({ open, onClose, herdName = null, title = "share with the herd"}) => {

  const [newHerd, setNewHerd] = useState({
    name: "",
    description: "",
  });

  const [image, setImage] = useState(null)

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      setImage(file)
  };

  const handleHerdChange = (e) => {
    const { name, value } = e.target;
    setNewHerd((prevHerd) => ({
      ...prevHerd,
      [name]: value,
    }));
    console.log("Updated herd state:", newHerd);
  };

  const handleCreateHerd = async () => {
    const requestBody = new FormData()
    Object.keys(newHerd).forEach((key) => {
        requestBody.append(key, newHerd[key])
    })
    image && requestBody.append("image", image)
    const response = await fetch(`${apiUrl}/api/herds/new`, {
      credentials: "include",
      method: "PUT",
      body: requestBody 
    })

    if (!response.ok) {
      alert("Failed to create herd")
      return
    } else {
      const data = await response.json()
      alert(data.msg)
      setImage(null)
      setNewHerd({
        name: "",
        description: ""
      })
      onClose()
    }
  }

  return (
    < CustomDrawer isOpen={open} onClose={onClose} >
      <Typography variant="h6" sx={{ marginBottom: '10px', color: '#264653', fontFamily: 'Cabin' }}>Create a New Herd</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
              src={image ? URL.createObjectURL(image) : ""}
              alt="Herd Image"
              sx={{ width: 80, height: 80, mr: 2 }}
          />
          <input
              accept="image/*"
              id="image-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e)}
          />
          <label htmlFor="image-upload">
              <IconButton color="primary" aria-label="upload profile picture" component="span">
                  <PhotoCamera sx={{ color: '#264653' }}/>
              </IconButton>
          </label>
          <IconButton onClick={() => setImage(null)} color="primary" aria-label="de-select profile picture" component="span">
              <Delete sx={{color: '#264653'}}/>
          </IconButton>
          {image && <Typography variant="caption">selected pfp: {image.name}</Typography>}
        Upload Herd Image
      </Box>

      <Box sx={{ width: '100%' }}>
        <TextField
          autoFocus
          margin="dense"
          label="name"
          name="name"
          fullWidth
          variant="standard"
          value={newHerd.name}
          onChange={handleHerdChange}
          sx={{fontFamily: 'Cabin'}}
        />
      </Box>

      <Box sx={{ width: '100%' }}>
        <TextField
          margin="dense"
          label="description"
          name="description"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          value={newHerd.description}
          onChange={handleHerdChange}
          sx={{fontFamily: 'Cabin'}}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button onClick={onClose} sx={{textTransform: 'none', color: '264653', fontFamily: 'Cabin'}}>cancel</Button>
        <Button onClick={handleCreateHerd} variant="contained" color="primary" sx={{ marginLeft: '10px', backgroundColor: '#264653', textTransform: 'none' , fontFamily: 'Cabin'}}>Create Herd</Button>
      </Box>
    </CustomDrawer >);
}
export default CreateHerdDrawer;
