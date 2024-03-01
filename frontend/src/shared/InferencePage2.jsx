import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import colormap from 'colormap';
import './styles.css'; // Import your stylesheet
import pica from 'pica';
import Button from '@mui/material/Button';

import UploadImage from './UploadImage';
import DisplayImage from './DisplayImage';
import InferenceInputs from './InferenceInputs';
import VisSegmentation from './VisSegmentation';
import VisDetection from './VisDetection';

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

export default function InferencePage2() {
  const [imageSrc, setImageSrc] = useState('');
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

  const handleConfidenceThres = (name, confThres) => {
    var startTime = performance.now();
    setConfidenceThres(prevConfidences => ({...prevConfidences, [name]: confThres}))
    var endTime = performance.now();
    var executionTime = endTime - startTime;
    console.log(`모듈 실행 시간 setConfidenceThres: ${executionTime}ms`);

    if (task === 'segmentation'){
      startTime = performance.now();
      applyThresholdToEncodedImage(segmentationResult[name], confThres,
                      Object.keys(confidenceThres).indexOf(name))
      .then((filteredSrc) => {
        endTime = performance.now();
        executionTime = endTime - startTime;
        console.log(`모듈 실행 시간 applyThresholdToEncodedImage: ${executionTime}ms`);

        startTime = performance.now();
        setFilteredImage(prev => ({...prev , [name]: filteredSrc}));
        endTime = performance.now();
        executionTime = endTime - startTime;
        console.log(`모듈 실행 시간 setFilteredImage: ${executionTime}ms`);
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

        if (name !== label){
          tmp.push(val);
        } 
        else {
          if (confidence >= confThres) {
          tmp.push(val);
          }
        }
      })
      setFilteredDetectionResult(tmp);
    }
  }

  const getImageFromBackend = async () => {
    try {
        const response = await fetch('http://localhost:8000/get-image', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch image from backend');
        }

        const data = await response.json();
        const imageSrc = `data:image/jpeg;base64,${data.image}`;
        setTask(data.task);
        setUploadedImage(imageSrc);
        setImageDataUrl(imageSrc)

        if (data.task === 'segmentation') {
          var colorIndex = 0;
          Object.entries(data.prediction).forEach(([key, val]) => {
            setsegmentationResult(prev => ({...prev , [key]: val}));
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
        }
        else if (data.task === 'detection'){
          console.log(">>>>>>>>>>>>>>>>>> ", data.prediction)
          setDetectionResult(data.prediction);
          setFilteredDetectionResult(data.prediction);
          Object.entries(data.prediction).map(([key, val]) => {
            setConfidenceThres(prevConfidences => ({...prevConfidences, [val.label]: 0.25}))
          })
        }


    } catch (error) {
        console.error('Error fetching image:', error);
    }
};



const applyThresholdToEncodedImage = (base64Image, threshold, colorIndex) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64Image}`;

    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      const resizeFactor = 0.1; // You can adjust the resize factor as needed

      // Create a temporary canvas for resizing
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      tempCanvas.width = Math.floor(originalWidth * resizeFactor);
      tempCanvas.height = Math.floor(originalHeight * resizeFactor);
      tempContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

      // Create the main canvas for thresholding
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = originalWidth;
      canvas.height = originalHeight;

      // Use pica to resize the image
      const picaInstance = pica();
      picaInstance.resize(tempCanvas, canvas).then(() => {
        // Draw the resized image onto the main canvas
        context.drawImage(canvas, 0, 0, originalWidth, originalHeight);

        // Get the image data
        const imageData = context.getImageData(0, 0, originalWidth, originalHeight);

        // Apply threshold to the image
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i] < threshold) {
            imageData.data[i + 3] = 0;
          } else {
            imageData.data[i] = colorMap[colorIndex][0];
            imageData.data[i + 1] = colorMap[colorIndex][1];
            imageData.data[i + 2] = colorMap[colorIndex][2];
            imageData.data[i + 3] = 255;
          }
        }

        // Put the thresholded image data back to the main canvas
        context.putImageData(imageData, 0, 0);

        // Convert the canvas to base64
        const filteredSrc = canvas.toDataURL('image/png');
        resolve(filteredSrc);
      });
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
        <Button variant="contained" onClick={getImageFromBackend}>
          이미지 가져오기
        </Button>
      </Grid>
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

      {/* {uploadedImage && <img src={uploadedImage} alt="Fetched Image" />} */}

    </Grid>
    </Box>
  );
}