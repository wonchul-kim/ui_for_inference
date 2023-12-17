import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

import CustomSlider from './CustomSlider';

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function InferenceInputs({title, confidenceThres, handleConfidenceThres}) {
  const [value, setValue] = React.useState(confidenceThres);

  // React.useEffect(() => {
  //   console.log("title: ", title)
  // })
  
  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    handleConfidenceThres(title, newValue)
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
    handleConfidenceThres(title, event.target.value === '' ? 0 : Number(event.target.value))
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  return (
        <CustomSlider
            title={title}
            value={value}
            handleSliderChange={handleSliderChange}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur} 
        />
  );
}