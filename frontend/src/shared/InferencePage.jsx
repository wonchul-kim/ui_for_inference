import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import colormap from 'colormap';
import './styles.css'; // Import your stylesheet

import UploadImage from './UploadImage';
import DisplayImage from './DisplayImage';
import InferenceInputs from './InferenceInputs';
import VisSegmentation from './VisSegmentation';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const colorMap = [[255, 0, 0], [0, 255, 0], [0, 0, 255], 
                  [255, 255, 0], [255, 0, 255], [153, 153, 255], 
                  [255, 153, 204], [255, 102, 0], [51, 153, 102],
                  [153, 153, 255], [128, 0, 128], [153, 204, 0]]

export default function InferencePage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [segmentationDataUrl, setSegmentationDataUrl] = useState({});
  const [imageShape, setImageShape] = useState(null);
  const [confidenceThres, setConfidenceThres] = useState({});
  const [filteredImage, setFilteredImage] = useState({});
  const [arrayImage, setArrayImage] = useState(null);

  const handleConfidenceThres = (name, confThres) => {
    setConfidenceThres(prevConfidences => ({...prevConfidences, [name]: confThres}))

    applyThresholdToEncodedImage(segmentationDataUrl[name], confThres,
                    Object.keys(confidenceThres).indexOf(name))
    .then((filteredSrc) => {
      // console.log("Filtered Image Source:", filteredSrc);
      setFilteredImage(prev => ({...prev , [name]: filteredSrc}));
    })
    .catch((error) => {
      console.error("Error processing image:", error);
    });
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
        var colorIndex = 0;
        Object.entries(preds).forEach(([key, val]) => {
          setSegmentationDataUrl(prev => ({...prev , [key]: val}));
          setConfidenceThres(prevConfidences => ({...prevConfidences, [key]: 128}))
          applyThresholdToEncodedImage(val, 128, colorIndex)
            .then((filteredSrc) => {
              // console.log("Filtered Image Source:", filteredSrc);
              setFilteredImage(prev => ({...prev , [key]: filteredSrc}));
            })
            .catch((error) => {
              console.error("Error processing image:", error);
            });
          colorIndex += 1;
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

  const applyThresholdToEncodedImage = (base64Image, threshold, colorIndex) => {
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
        const data = new Uint8Array(imageData.data.buffer);
        console.log(">>> colorIndex: ", colorIndex, threshold)
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] < threshold){
            data[i] = colorMap[colorIndex][0];
            data[i + 1] = colorMap[colorIndex][1];
            data[i + 2] = colorMap[colorIndex][2];           
            data[i + 3] = 255;
          }
          else {
            data[i + 3] = 0;
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
  
  
  const jsonData = {
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
      <Grid item xs={12}>
        <h1 className="title">Image Upload and Processing</h1>
        <div className="upload-section">
          <UploadImage onUploadImage={handleUploadImage} />
        </div>
      </Grid>
      <VisSegmentation title="All Channels"
                      srcImage={imageDataUrl} resImage={filteredImage}
                      confidenceThres={confidenceThres} 
                      handleConfidenceThres={handleConfidenceThres}
                      jsonData={jsonData}
      />
    </Grid>
    </Box>
  );
}