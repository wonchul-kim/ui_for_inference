import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import './styles.css'; // Import your stylesheet

import InferenceInputs from './InferenceInputs';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
  
export default function HandleChannelImage({srcImage, resImage, confidenceThres,
                                       handleConfidenceThres, jsonData})
{
  return (
    <Box sx={{ flexGrow: 1 }} className='container'>
        {resImage && Object.keys(resImage).length !== 0 && (
            Object.entries(resImage).map(([key, val]) => (
                <Grid container spacing={2}>
                <Grid item xs={8}>       
                <div className="preview-container">
                <h2 className="preview-title">{key}</h2>
                <div className="preview-image-container">
                    <img
                    src={srcImage}
                    alt="Uploaded"
                    className="preview-image"
                    />
                    <img
                    key={key}
                    // src={`data:image/png;base64,${val}`}
                    src={val}
                    alt={key}
                    className="overlay-image"
                    onError={(e) => console.error("Error loading channel image: ", e)}
                    />
                </div>
                </div>
                </Grid>
                <Grid item xs={4}>
                    <Item>
                        <InferenceInputs confidenceThres={confidenceThres}
                                        handleConfidenceThres={handleConfidenceThres}
                                        jsonData={jsonData}/>    
                    </Item>
                </Grid>
                </Grid>
                    ))
                )
            }
    </Box>
  );
}