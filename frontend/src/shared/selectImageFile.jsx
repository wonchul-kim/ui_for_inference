import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function SelectImageFile({title, imageFileList, selectedImageFile, setSelectedImageFile}) {
    return (
        <FormControl sx={{ m: 1, minWidth: 300 }}>
        <InputLabel id="demo-multiple-name-label">{title}</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          label={title}
          value={selectedImageFile}
          onChange={(event) => setSelectedImageFile(event.target.value)}
          autoWidth
        >
          {imageFileList.map((imageFile) => (
            <MenuItem
              key={imageFile}
              value={imageFile}
            >
              {imageFile}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
}