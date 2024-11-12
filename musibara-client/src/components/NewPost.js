'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Drawer, IconButton, Container } from '@mui/material';
import { FaPlus } from 'react-icons/fa6';


const NewPost = () => {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);  // New state for drawer

    const toggleDrawer = (open) => () => {
        setIsDrawerOpen(open);
    };

    return (
        <Container className="postContainer">
            <IconButton onClick={toggleDrawer(true)}>
                <FaPlus size={35} />
            </IconButton>

            <Drawer
                anchor="bottom"
                open={isDrawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        position: "relative",
                        width: '250px',
                    },
                }}
            >
                {/* Content for the Drawer */}
                hello
            </Drawer>
        </Container>
    )
}

export default NewPost;
