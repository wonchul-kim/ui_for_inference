// UploadImage.js

import React, { useState } from 'react';
import './styles.css';

const UploadImage = ({ onUploadImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    handleImage(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    handleImage(file);
  };

  const handleImage = (file) => {
    if (file) {
      onUploadImage(file);
    }
  };

  return (
    <div
      className={`upload-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label htmlFor="fileInput" className="upload-button">
        Upload Image
      </label>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
      <p className="drag-text">or drag and drop an image here</p>
    </div>
  );
};

export default UploadImage;
