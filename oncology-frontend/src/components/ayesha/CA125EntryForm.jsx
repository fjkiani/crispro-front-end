/**
 * CA125EntryForm - Entry/update form for CA-125 value
 */
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  Chip,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';

const getBurdenClass = (value) => {
  if (value === null || value === undefined) return null;
  if (value <= 35) return { class: 'NORMAL', color: 'success' };
  if (value <= 200) return { class: 'MINIMAL', color: 'info' };
  if (value <= 1000) return { class: 'MODERATE', color: 'warning' };
  return { class: 'EXTENSIVE', color: 'error' };
};

const CA125EntryForm = ({ currentValue = null, onSubmit }) => {
  const [value, setValue] = useState(currentValue ?? '');
  const [error, setError] = useState(null);
  const burden = getBurdenClass(currentValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0) {
      setError('Please enter a valid CA-125 value');
      return;
    }

    setError(null);
    onSubmit(numValue);
  };

  return (
    <Card
      sx={{
        border: currentValue ? '1px solid' : '2px dashed',
        borderColor: currentValue ? 'divider' : 'warning.main',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ScienceIcon color={currentValue ? 'primary' : 'warning'} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              CA-125 Value
            </Typography>
          </Box>
          {burden && (
            <Chip
              label={`${burden.class}: ${currentValue} U/mL`}
              color={burden.color}
              size="small"
            />
          )}
        </Box>

        {!currentValue && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter CA-125 to enable disease burden tracking and KELIM forecasting.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box display="flex" gap={2} alignItems="flex-start">
            <TextField
              label={currentValue ? 'Update CA-125' : 'Enter CA-125'}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={!!error}
              helperText={error}
              InputProps={{
                endAdornment: <InputAdornment position="end">U/mL</InputAdornment>,
              }}
              sx={{ width: 200 }}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>
              {currentValue ? 'Update' : 'Save'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default CA125EntryForm;
