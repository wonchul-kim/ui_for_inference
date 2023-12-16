import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import './styles.css'; // Import your stylesheet

import UploadImage from './UploadImage';
import DisplayImage from './DisplayImage';
import InferenceInputs from './InferenceInputs';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
  
export default function InferencePage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [segmentationDataUrl, setSegmentationDataUrl] = useState(null);

  useEffect(() => {
    console.log("imageDataUrl: ", imageDataUrl)
  }, [imageDataUrl])

  const handleUploadImage = (image) => {
    setUploadedImage(image);

    // Display the uploaded image (optional)
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImageDataUrl(dataUrl);
    };
    reader.readAsDataURL(image);

    sendImageToBackend(image).then(async (segmentationResult) => {
      try {
        // Display the segmentation result
        setSegmentationDataUrl(`data:image/png;base64,${await segmentationResult}`);
      } catch (error) {
        console.error('Error:', error.message);
      }
    }).catch((error) => {
      console.error('Error:', error.message);
    });
  };

  const sendImageToBackend = async (image) => {
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:8000/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Handle successful response from the backend (if needed)
        const result = await response.json();
        console.log('Backend response:', result);
        
        return result.prediction; // Assuming the result has a property 'segmentation_prediction'

      } else {
        // Handle error response from the backend
        console.error('Error uploading image to the backend.');
      }
    } catch (error) {
      // Handle network or other errors
      console.error('Error:', error.message);
    }
  };

  const sampleJson = {
      key1: 'value1',
      key2: 'value2',
      key3: {
          nestedKey1: 'nestedValue1',
          nestedKey2: 'nestedValue2',
      },
    };

  return (
    <Box sx={{ flexGrow: 1 }} className='container'>
    <Grid container spacing={2}>
        <Grid item xs={8}>
        <h1 className="title">Image Upload and Processing</h1>

        <div className="upload-section">
          <UploadImage onUploadImage={handleUploadImage} />

          {uploadedImage && (
            <div className="preview-container">
              <h2 className="preview-title">Uploaded Image Preview</h2>
              <div className="preview-image-container">
                <img
                  src={imageDataUrl}
                  alt="Uploaded"
                  className="preview-image"
                />
                {segmentationDataUrl && (
                  <img
                    src={segmentationDataUrl}
                    alt="Segmentation"
                    className="overlay-image"
                  />
                )}
              </div>
            </div>
          )}
        </div>

          <Item>
            <DisplayImage />   
          </Item>
          </Grid>
          <Grid item xs={4}>
          <Item>
            <InferenceInputs jsonData={sampleJson}/>    
          </Item>
        </Grid>
    </Grid>
    </Box>
  );
}