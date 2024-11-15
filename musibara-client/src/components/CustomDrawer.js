import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CustomDrawer = ({ isOpen, onClose, containerRef, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '100%',
        height: '75vh',
        borderTopLeftRadius: '15px',
        borderTopRightRadius: '15px',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease-in-out',
        overflow: 'hidden',
        zIndex: 999,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 10, right: 10 }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CustomDrawer;