import React, { useEffect, useRef } from 'react';
import './styles.css';

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

const DrawRectangles = ({ srcImage, detectionResult }) => {
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
        context.lineWidth = 15; // Set rectangle border width

        context.beginPath();
        context.rect(points[0], points[1], points[2] - points[0], points[3] - points[1]);
        context.stroke();

        // Display label near the rectangle
        context.fillStyle = namedColors[index];
        context.font = '100px Arial';
        context.fillText(label, points[0] + 10, points[1] + 100);
      });
    };
  }, [detectionResult]);

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
      <button onClick={handleDownload}>Download Image</button>
    </div>
  );
};

export default DrawRectangles;
