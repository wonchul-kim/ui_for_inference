import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';

const threshold = 128; // Set your threshold value

const useStyles = makeStyles((theme) => ({
  filteredImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
}));

const FilteredImage = ({ base64Image, threshold }) => {
  const classes = useStyles();
  const [filteredSrc, setFilteredSrc] = useState('');

  useEffect(() => {
      const img = new Image();
      img.src = `data:image/png;base64,${base64Image}`;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
  
        context.drawImage(img, 0, 0, img.width, img.height);
  
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
  
        // Apply threshold filter to color channels
        for (let i = 0; i < data.length; i += 4) {
          const pixelValue = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (pixelValue < threshold) {
            data[i] = data[i + 1] = data[i + 2] = 0; // Set color channels to 0
          }
        }
  
        context.putImageData(imageData, 0, 0);
  
        // Convert the canvas to base64
        const filteredSrc = canvas.toDataURL('image/png');
        setFilteredSrc(filteredSrc);
      };
    }, [base64Image]);
  
    return <img src={filteredSrc} alt="Filtered Image" className={classes.filteredImage} />;
  };
  
  export default FilteredImage;
  