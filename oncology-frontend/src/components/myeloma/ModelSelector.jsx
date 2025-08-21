import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const ModelSelector = ({ value, onChange }) => {
  const handle = (e) => {
    const v = e.target.value;
    try { window.__mdt_model_id = v; } catch (_) {}
    onChange && onChange(v);
  };
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>Model</InputLabel>
      <Select label="Model" value={value} onChange={handle}>
        <MenuItem value="evo2_1b">Evo2 1B</MenuItem>
        <MenuItem value="evo2_7b">Evo2 7B</MenuItem>
        <MenuItem value="evo2_40b">Evo2 40B</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ModelSelector; 