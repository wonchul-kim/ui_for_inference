import React, { useEffect, useRef } from 'react';
import './styles.css';
import Button from '@mui/material/Button'; // 추가: 버튼 라이브러리 가져오기

const namedColors = [
  'red',
  'blue',
  'darkgreen',
  'darkyellow',
  'darkmagenta',
  'purple',
  'fuchsia',
  'deeppink',
  'olive',
  'navy',
  'teal',
  'aqua',
];

const DrawRectangles = ({ srcImage, detectionResult, lineWidth, fontSize}) => {
  const canvasRef = useRef(null);
  const legendRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const legend = legendRef.current;

    const img = new Image();
    img.src = srcImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      context.drawImage(img, 0, 0);

      // Draw rectangles based on the detectionResult
      var tmp = [];
      const legendItems = [];
      var index = -1;
      console.log(">>> detecionReulst: ", detectionResult)
      detectionResult.forEach(rect => {
        const { points, label } = rect;
        if (!tmp.includes(label)){
            tmp.push(label);
            index += 1;
            legendItems.push({label, color: namedColors[index]})
        }

        context.strokeStyle = namedColors[index]; // Set rectangle border color
        context.lineWidth = lineWidth; // Set rectangle border width

        context.beginPath();
        context.rect(points[0], points[1], points[2] - points[0], points[3] - points[1]);
        context.stroke();

        // Display label near the rectangle
        context.fillStyle = namedColors[index];
        context.font = `${fontSize}px Arial`; // 폰트 크기 변경
        context.fillText(label, points[0], points[1] - 10);
      });
    };
  }, [detectionResult, lineWidth, fontSize]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    link.download = 'image.png'; // 파일 이름 지정
    link.href = image;
    link.click();
  };

  return (
    <div className="preview-container">
      <div className="preview-image-container">
        <canvas ref={canvasRef} className="preview-image" />
      </div>
      <div ref={legendRef} className="legend-container"></div>

      <Button variant="contained" onClick={handleDownload}>Download Image</Button>
    </div>
  );
};

export default DrawRectangles;
