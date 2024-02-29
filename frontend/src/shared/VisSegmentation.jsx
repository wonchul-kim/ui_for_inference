import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button'; // 추가: 버튼 라이브러리 가져오기
import { styled } from '@mui/material/styles';
import './styles.css'; // Import your stylesheet

import InferenceInputs from './InferenceInputs';
import HandleChannelImage from './HandleChannelImage';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
  
export default function VisSegmentation({title, srcImage, resImage, confidenceThres,
                                       handleConfidenceThres, maxValue, jsonData})
{
  const [overlayImageSrc, setOverlayImageSrc] = useState(null); // 추가: overlay 된 이미지 소스

  // 추가: overlay 된 이미지 생성 함수
  const generateOverlayImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // srcImage를 캔버스에 그립니다.
    const srcImg = new Image();
    srcImg.src = srcImage;
    srcImg.onload = () => {
      canvas.width = srcImg.width;
      canvas.height = srcImg.height;
      ctx.drawImage(srcImg, 0, 0);

      // resImage의 각각의 overlay 이미지를 캔버스에 그립니다.
      Object.entries(resImage).forEach(([key, val]) => {
        const overlayImg = new Image();
        overlayImg.src = val;
        overlayImg.onload = () => {
          ctx.drawImage(overlayImg, 0, 0);
          setOverlayImageSrc(canvas.toDataURL()); // 캔버스의 내용을 데이터 URL로 설정하여 상태 업데이트
        };
      });
    };
  };

  // useEffect를 사용하여 overlay 이미지가 변경될 때마다 generateOverlayImage 함수를 호출합니다.
  useEffect(() => {
    if (resImage && Object.keys(resImage).length !== 0) {
      generateOverlayImage();
    }
  }, [resImage]);

  // 추가: 다운로드 함수
  const downloadOverlayImage = () => {
    const link = document.createElement('a');
    link.href = overlayImageSrc;
    link.download = 'overlay_image.png'; // 다운로드할 이미지의 파일 이름 설정
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='container'>
      {srcImage && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className="preview-container">
              <h2 className="preview-title">{title}</h2>
              <div className="preview-image-container">
                <img
                  src={srcImage}
                  alt="srcImage"
                  className="preview-image"
                />
                {Object.keys(resImage).length !== 0 && 
                  Object.entries(resImage).map(([key, val]) => (
                    <img
                      src={val}
                      alt={key}
                      className="overlay-image"
                      onError={(e) => console.error(`Error loading image for key ${key}:`, e)}
                    />
                  ))}
              </div>
            </div>
            {overlayImageSrc && ( // 추가: overlayImageSrc가 있는 경우에만 다운로드 버튼 표시
              <Button variant="contained" onClick={downloadOverlayImage}>
                Download Overlay Image
              </Button>
            )}
          </Grid>
          <Grid item xs={12}>
            {jsonData && (
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
      <HandleChannelImage srcImage={srcImage} resImage={resImage}
                          confidenceThres={confidenceThres} 
                          handleConfidenceThres={handleConfidenceThres}
                          jsonData={jsonData}
                          maxValue={maxValue}
      />
    </Box>
  );
}
