import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import './styles.css'; // Import your stylesheet

import InputSlider from './inputSlider';
import InferenceInputs from './InferenceInputs';
import DrawRectangles from './DrawRectangles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
  
export default function VisDetection({title, srcImage, filteredDetectionResult, detColorMap, 
                                        confidenceThres,
                                       handleConfidenceThres, maxValue,
                                       lineWidth, setLineWidth, fontSize, setFontSize})
{
  return (
    <Box sx={{ flexGrow: 1 }} className='container'>
      {srcImage && (
        <Grid container spacing={2}>
            <Grid item xs={12}>
            <div className="preview-container">
              <h2 className="preview-title">{title}</h2>
              <div className="preview-image-container">
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>

              <InputSlider title={"Line Width"} 
                            val={lineWidth} setVal={setLineWidth} 
                          maxValue={20} minValue={0} stepValue={1} 
              />
              <InputSlider title={"Font Size"} 
                            val={fontSize} setVal={setFontSize} 
                          maxValue={100} minValue={0} stepValue={5} 
              />
              </Box>
              <DrawRectangles srcImage={srcImage} detectionResult={filteredDetectionResult}
                            lineWidth={lineWidth} fontSize={fontSize}
              />
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            {confidenceThres.length !== 0 && (
              <Item>
                <h2 className="preview-title">Confidences</h2>
                {Object.keys(confidenceThres).length !== 0 && (
                  Object.entries(confidenceThres).map(([key, val]) => (
                    <InferenceInputs
                      key={key}  
                      title={key}
                      confidenceThres={val}
                      handleConfidenceThres={handleConfidenceThres}
                      maxValue={maxValue}
                    />
                  ))
                )}
              </Item>
            )}
          </Grid>         
          </Grid>
          )}
          
    </Box>
  );
}