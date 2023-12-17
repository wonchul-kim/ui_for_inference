import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import './styles.css'; // Import your stylesheet

import InferenceInputs from './InferenceInputs';
import HandleChannelImage from './HandleChannelImage';
import { filledInputClasses } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
  
export default function VisSegmentation({title, srcImage, resImage, confidenceThres,
                                       handleConfidenceThres, jsonData})
{
  return (
    <Box sx={{ flexGrow: 1 }} className='container'>
      {srcImage && (
        <Grid container spacing={2}>
            <Grid item xs={8}>
            <div className="preview-container">
              <h2 className="preview-title">{title}</h2>
              <div className="preview-image-container">
                <img
                  src={srcImage}
                  alt="srcImage"
                  className="preview-image"
                />
                {/* {Object.keys(segmentationDataUrl).length !== 0 && 
                  Object.entries(segmentationDataUrl).map(([key, val]) => (
                  <img
                    // key={key}
                    src={val}
                    alt={key}
                    className="overlay-image"
                    onError={(e) => console.error(`Error loading image for key ${key}:`, e)}
                  />
                ))} */}
                {Object.keys(resImage).length !== 0 && (
                  <img
                    // key={key}
                    src={resImage['channel1']}
                    // src={`data:image/png;base64,${resImage['channel1']}`}
                    alt='channel1'
                    className="overlay-image"
                  />
                )}
              </div>
            </div>
          </Grid>
          <Grid item xs={4}>
            {jsonData && (
              <Item>
                <InferenceInputs confidenceThres={confidenceThres}
                                  handleConfidenceThres={handleConfidenceThres}
                                  jsonData={jsonData}/>    
              </Item>
            )}
          </Grid>
          </Grid>
          )}
          
        <HandleChannelImage srcImage={srcImage} resImage={resImage}
                            confidenceThres={confidenceThres} 
                            handleConfidenceThres={handleConfidenceThres}
                            jsonData={jsonData}
        />



    </Box>
  );
}