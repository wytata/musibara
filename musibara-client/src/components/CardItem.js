// components/CardItem.js
import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';

const CardItem = ({ image, name, onClick }) => {
  return (
    <Card sx={{ maxWidth: 345 }} className="herdCard">
      <CardActionArea onClick={onClick}>
        <CardMedia component="img" image={image} alt={name} />
        <CardContent>
          <Typography variant="h6" className="cardName">
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CardItem;
