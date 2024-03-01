import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import colormap from 'colormap';
import './styles.css'; // Import your stylesheet
import pica from 'pica';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import UploadImage from './UploadImage';
import DisplayImage from './DisplayImage';
import InferenceInputs from './InferenceInputs';
import VisSegmentation from './VisSegmentation';
import VisDetection from './VisDetection';
import ShowJson from './ShowJson';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const colorMap = [[255, 0, 0], [0, 255, 0], [0, 0, 255], 
                  [255, 255, 0], [255, 0, 255], [153, 153, 255], 
                  [255, 153, 204], [255, 102, 0], [51, 153, 102],
                  [153, 153, 255], [128, 0, 128], [153, 204, 0]]

export default function InferencePage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [segmentationResult, setsegmentationResult] = useState({});
  const [detectionResult, setDetectionResult] = useState([]);
  const [filteredDetectionResult, setFilteredDetectionResult] = useState([]);
  const [imageShape, setImageShape] = useState(null);
  const [confidenceThres, setConfidenceThres] = useState({});
  const [filteredImage, setFilteredImage] = useState({});
  const [arrayImage, setArrayImage] = useState(null);
  const [task, setTask] = useState(null);
  const [ratio, setRatio] = useState(1);
  const [jsonData, setJsonData] = useState({
                                              key1: 'value1',
                                              key2: 'value2',
                                              key3: {
                                                  nestedKey1: 'nestedValue1',
                                                  nestedKey2: 'nestedValue2',
                                              },
                                            });

  // modal to show jsonData
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfidenceThres = (name, confThres) => {
        setConfidenceThres(prevConfidences => ({...prevConfidences, [name]: confThres}))

    if (task === 'segmentation'){
      applyThresholdToEncodedImage(segmentationResult[name], confThres,
                      Object.keys(confidenceThres).indexOf(name), ratio)
      .then((filteredSrc) => {
        // console.log("Filtered Image Source:", filteredSrc);
        setFilteredImage(prev => ({...prev , [name]: filteredSrc}));
      })
      .catch((error) => {
        console.error("Error processing image:", error);
      });
    }
    else if (task === 'detection') {
      const tmp = [];
      Object.entries(detectionResult).map(([key, val])  => {
        const label = val.label;
        const confidence = val.confidence;

        if (name === label){
          if (confidence >= confThres){
            tmp.push(val);
          }
        } 
        else {
          if (confidence >= confidenceThres[label]) {
              tmp.push(val);
          }
        }
      })
      setFilteredDetectionResult(tmp);
    }
  }

  const handleUploadImage = (image) => {
    console.log("image: ", image)
    setUploadedImage(image);

    
    // Display the uploaded image (optional)
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImageDataUrl(dataUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        console.log("Image width:", width);
        console.log("Image height:", height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(image);

    sendImageToBackend(image).then(async (resp) => {
      try {
        console.log("Response: ", resp)
        setTask(resp.task);
        setRatio(resp.ratio);
        // // For segmentationResult,
        if (resp.task === 'segmentation') {
          var colorIndex = 0;
          Object.entries(resp.prediction).forEach(([key, val]) => {
            setsegmentationResult(prev => ({...prev , [key]: val}));
            setConfidenceThres(prevConfidences => ({...prevConfidences, [key]: 128}))
            applyThresholdToEncodedImage(val, 128, colorIndex, resp.ratio)
              .then((filteredSrc) => {
                // console.log("Filtered Image Source:", filteredSrc);
                setFilteredImage(prev => ({...prev , [key]: filteredSrc}));
              })
              .catch((error) => {
                console.error("Error processing image:", error);
              });
            colorIndex += 1;
          })
        }
        else if (resp.task === 'detection'){
          setDetectionResult(resp.prediction);
          setFilteredDetectionResult(resp.prediction);
          Object.entries(resp.prediction).map(([key, val]) => {
            setConfidenceThres(prevConfidences => ({...prevConfidences, [val.label]: 0.25}))
          })
        }
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

        return result; // Assuming the result has a property 'segmentation_prediction'

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
        const originalWidth = img.width;
        const originalHeight = img.height;
        console.log(">>>> originalWidth: ", originalWidth)
        console.log(">>>> originalHeight: ", originalHeight)
        const resizeFactor = 0.1; // 작은 사이즈로 리사이징할 비율
  
        // Create a temporary canvas for resizing
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = Math.floor(originalWidth * resizeFactor);
        tempCanvas.height = Math.floor(originalHeight * resizeFactor);
        console.log(">>>> tempCanvas.width: ", tempCanvas.width)
        console.log(">>>> tempCanvas.height: ", tempCanvas.height)
        tempContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
  
        // Apply threshold to the resized image
        const resizedImageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        for (let i = 0; i < resizedImageData.data.length; i += 4) {
          if (resizedImageData.data[i] < threshold) {
            resizedImageData.data[i + 3] = 0;
          } else {
            resizedImageData.data[i] = colorMap[colorIndex][0];
            resizedImageData.data[i + 1] = colorMap[colorIndex][1];
            resizedImageData.data[i + 2] = colorMap[colorIndex][2];
            resizedImageData.data[i + 3] = 255;
          }
        }
  
        // Put the thresholded image data back to the temporary canvas
        tempContext.putImageData(resizedImageData, 0, 0);
  
        // Use pica to resize the image back to the original size
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        const picaInstance = pica();
        picaInstance.resize(tempCanvas, canvas).then(() => {
          // Convert the canvas to base64
          const filteredSrc = canvas.toDataURL('image/png');
          resolve(filteredSrc);
        }).catch((error) => {
          reject(error);
        });
      };
  
      img.onerror = (error) => {
        reject(error);
      };
    });
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
    </Grid>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button onClick={handleOpen}>
        <Typography variant="body1" style={{ fontWeight: 'bold' }}>SHOW Annotations</Typography>
      </Button>
    </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Annotations by JSON Format
          </Typography>
          <Item>
            <ShowJson jsonData={jsonData} />
          </Item>
        </Box>
      </Modal>
      {task && task === 'segmentation' && (
        <VisSegmentation title="All Predictions"
                        srcImage={imageDataUrl} resImage={filteredImage}
                        confidenceThres={confidenceThres} 
                        handleConfidenceThres={handleConfidenceThres}
                        jsonData={jsonData}
                        maxValue={255}
        />
      )
      }
      {task && task === 'detection' && (
          <VisDetection title="All Predictions"
                          srcImage={imageDataUrl} filteredDetectionResult={filteredDetectionResult}
                          confidenceThres={confidenceThres} 
                          handleConfidenceThres={handleConfidenceThres}
                          jsonData={jsonData}
                          maxValue={1}
          />
      )
      }
    </Box>
  );
}