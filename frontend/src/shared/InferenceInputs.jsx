import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

import CustomSlider from './CustomSlider';
import ShowJson from './ShowJson';

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function InferenceInputs({jsonData}) {
  const [value, setValue] = React.useState(30);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  return (
    <div>
        <CustomSlider
            title={"Confidence"}
            value={value}
            handleSliderChange={handleSliderChange}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur} 
        />
        <CustomSlider
            title={"IoU"}
            value={value}
            handleSliderChange={handleSliderChange}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur} 
        />
        <CustomSlider
            title={"Accuracy"}
            value={value}
            handleSliderChange={handleSliderChange}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur} 
        />

        <ShowJson jsonData={jsonData} />
    </div>
    
  );
}