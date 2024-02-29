import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

const Input = styled(MuiInput)`
  width: 60px;
`;

export default function CustomSlider({title, value, handleSliderChange, 
                          handleInputChange, handleBlur,
                          maxValue}) 
{
  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
       {title && title !== "" && (
          <Grid item>
            <Typography variant="body1">{title}</Typography>
          </Grid>
        )}
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            max={maxValue}
            step={maxValue === 255 ? 1 : 0.05}
          />
        </Grid>
        <Grid item>
          <Input
            value={value}
            // size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: maxValue === 255 ? 1 : 0.01,
              min: 0,
              max: maxValue,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}