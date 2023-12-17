import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import './styles.css'; // Import your stylesheet

import UploadImage from './UploadImage';
import DisplayImage from './DisplayImage';
import InferenceInputs from './InferenceInputs';
import FilteredImage from './FilteredImage';


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
      tmp[key] = applyThresholdToEncodedImage(val, confThres)
      .then((filteredSrc) => {
        // console.log("Filtered Image Source:", filteredSrc);
        setFilteredImage(prev => ({...prev , [key]: filteredSrc}));
      })
      .catch((error) => {
        console.error("Error processing image:", error);
      });
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
          applyThresholdToEncodedImage(val, 0)
            .then((filteredSrc) => {
              // console.log("Filtered Image Source:", filteredSrc);
              setFilteredImage(prev => ({...prev , [key]: filteredSrc}));
            })
            .catch((error) => {
              console.error("Error processing image:", error);
            });

          // setFilteredImage(prev => ({...prev , [key]: applyThresholdToEncodedImage(val, 0)}));
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

  const applyThresholdToEncodedImage = (base64Image, threshold) => {
    return new Promise((resolve, reject) => {
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
        resolve(filteredSrc);
      };
  
      img.onerror = (error) => {
        reject(error);
      };
    });
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
                    src={filteredImage['channel1']}
                    // src={`data:image/png;base64,${filteredImage['channel1']}`}
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
                  // src={`data:image/png;base64,${val}`}
                  src={val}
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