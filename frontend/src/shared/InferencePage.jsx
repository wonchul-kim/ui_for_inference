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
  const [segmentationDataUrl, setSegmentationDataUrl] = useState({});
  const [imageShape, setImageShape] = useState(null);
  const [confidenceThres, setConfidenceThres] = useState(0);
  const [filteredImage, setFilteredImage] = useState({});

  const handleConfidenceThres = (confThres) => {
    setConfidenceThres(confThres);
    var tmp = {};
    Object.entries(segmentationDataUrl).forEach(([key, val]) => {
      tmp[key] = applyThresholdToEncodedImage(val, confThres);
    })
    setFilteredImage(tmp);
  }

  const handleUploadImage = (image) => {
    setUploadedImage(image);

    // Display the uploaded image (optional)
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImageDataUrl(dataUrl);
    };
    reader.readAsDataURL(image);

    sendImageToBackend(image).then(async (preds) => {
      try {
        // Display the segmentation result
        Object.entries(preds).forEach(([key, val]) => {
          setSegmentationDataUrl(prev => ({...prev , [key]: val}));
          setFilteredImage(prev => ({...prev , [key]: val}));
        })
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
        setImageShape(result.shape);

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

  function arraysAreEqual(array1, array2) {
    if (array1.length !== array2.length) {
        return false;
    }

    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }

    return true;
  }

  const applyThresholdToEncodedImage = (encodedImage, threshold) => {
    // Decode the base64-encoded image
    const decodedImage = atob(encodedImage);
    const imageArray = new Uint8Array(decodedImage.length);
    console.log(">>> ", decodedImage.length)
    for (let i = 0; i < decodedImage.length; i++) {
      imageArray[i] = decodedImage.charCodeAt(i);
    }
    const uniqueValues = [...new Set(imageArray)];
    // console.log(">>> UNIQUE: ", uniqueValues)
    // Assuming the image is in RGBA format
    const pixels = new Uint8Array(imageArray.buffer);
    // console.log('original: ', pixels)
    // console.log('original-threshold: ', threshold, pixels.includes(threshold))
    const thresholdedPixels = pixels.map(value => (value < 0) ? 0 : value);
    // console.log('thresholdedPixels: ', thresholdedPixels)
    // console.log('thresholdedPixels-threshold: ', threshold, thresholdedPixels.includes(threshold))
    // console.log(">>>>>>>>>>>>> ", arraysAreEqual(pixels,thresholdedPixels))

    // Encode the modified pixel array
    // const thresholdedImage = btoa(String.fromCharCode.apply(null, thresholdedPixels));
    const thresholdedImage = btoa(String.fromCharCode(...thresholdedPixels));

    return thresholdedImage;
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
                {/* {segmentationDataUrl && (
                  Object.entries(segmentationDataUrl).forEach(([key, val]) => {
                    <img
                      src={val}
                      alt="Segmentation"
                      className="overlay-image"
                    />
                  })
                )} */}
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
                {Object.keys(filteredImage).length !== 0 && (
                  <img
                    // key={key}
                    src={`data:image/png;base64,${filteredImage['channel1']}`}
                    alt='channel1'
                    className="overlay-image"
                  />
                )}
              </div>
            </div>
          )}
        </div>
          {uploadedImage && Object.keys(filteredImage).length !== 0 && (
            Object.entries(filteredImage).map(([key, val]) => (
              <div className="preview-container">
              <h2 className="preview-title">{key}</h2>
              <div className="preview-image-container">
                <img
                  src={imageDataUrl}
                  alt="Uploaded"
                  className="preview-image"
                />
                <img
                  key={key}
                  src={`data:image/png;base64,${val}`}
                  alt={key}
                  className="overlay-image"
                  onError={(e) => console.error("Error loading channel image: ", e)}
                />
              </div>
              </div>
                ))
            )
          }
          </Grid>
          <Grid item xs={4}>
          <Item>
            <InferenceInputs confidenceThres={confidenceThres}
                              handleConfidenceThres={handleConfidenceThres}
                              jsonData={sampleJson}/>    
          </Item>
        </Grid>
    </Grid>
    </Box>
  );
}