import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

const Input = styled(MuiInput)`
  width: 50px;
`;

export default function InputSlider({title, val, setVal, maxValue, minValue, stepValue}) {
  const [value, setValue] = React.useState(val);

  const handleValue = (val) => {
    setValue(val);
    setVal(val);
  }

  const handleSliderChange = (event, newValue) => {
    handleValue(newValue);
  };

  const handleInputChange = (event) => {
    handleValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      handleValue(0);
    } else if (value > 1) {
      handleValue(1);
    }
  };

  return (
    <Box sx={{ width: 350, marginRight: '30px'}}>
      <Typography id="input-slider" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
        <Slider
              value={typeof value === 'number' ? value * 100/maxValue : 0}
              onChange={(event, newValue) => handleSliderChange(event, newValue / (100/maxValue))}
              aria-labelledby="input-slider"
            />
        </Grid>
        <Grid item>
          <Input
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: stepValue,
              min: minValue,
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