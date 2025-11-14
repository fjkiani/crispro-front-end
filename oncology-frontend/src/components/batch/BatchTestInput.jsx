import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Stack,
  Grid,
  Paper,
  Autocomplete,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

/**
 * BatchTestInput Component
 * 
 * Allows users to input multiple compounds for batch testing.
 * Supports:
 * - Paste list (comma-separated, newline-separated)
 * - Manual entry (one at a time)
 * - Disease context configuration
 */
export default function BatchTestInput({
  compounds,
  onCompoundsChange,
  diseaseContext,
  onDiseaseContextChange,
  onTest,
  disabled = false
}) {
  const [inputText, setInputText] = useState('');
  const [inputMethod, setInputMethod] = useState('paste');

  // Common cancer-fighting foods for quick selection
  const QUICK_SELECT_FOODS = [
    'Green Tea',
    'Broccoli',
    'Papaya',
    'Purple Potatoes',
    'Pomegranates',
    'Garlic',
    'Ginger',
    'Turmeric',
    'Berries',
    'Fatty Fish',
    'Dark Chocolate',
    'Extra Virgin Olive Oil',
    'Mushrooms',
    'Bell Peppers',
    'Tomatoes',
    'Eggs',
    'Sauerkraut',
    'Kimchi',
    'Yogurt',
    'Kefir'
  ];

  const handlePaste = () => {
    if (!inputText.trim()) return;

    // Parse input (supports comma, newline, or semicolon separation)
    const parsed = inputText
      .split(/[,\n;]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Add to compounds list (avoid duplicates)
    const newCompounds = [...new Set([...compounds, ...parsed])];
    onCompoundsChange(newCompounds);
    setInputText('');
  };

  const handleAddQuickSelect = (food) => {
    if (!compounds.includes(food)) {
      onCompoundsChange([...compounds, food]);
    }
  };

  const handleRemoveCompound = (compound) => {
    onCompoundsChange(compounds.filter(c => c !== compound));
  };

  const handleTest = () => {
    if (compounds.length === 0) {
      return;
    }
    onTest();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Input Compounds
      </Typography>

      {/* Input Method Toggle */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant={inputMethod === 'paste' ? 'contained' : 'outlined'}
          onClick={() => setInputMethod('paste')}
          size="small"
        >
          Paste List
        </Button>
        <Button
          variant={inputMethod === 'manual' ? 'contained' : 'outlined'}
          onClick={() => setInputMethod('manual')}
          size="small"
        >
          Manual Entry
        </Button>
      </Stack>

      {/* Paste Method */}
      {inputMethod === 'paste' && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Paste compound names (one per line or comma-separated)"
            placeholder="Green Tea&#10;Broccoli&#10;Papaya&#10;Purple Potatoes&#10;Pomegranates"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            helperText="Supports comma, newline, or semicolon separation"
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handlePaste}
            disabled={!inputText.trim() || disabled}
          >
            Add to List
          </Button>
        </Box>
      )}

      {/* Manual Entry Method */}
      {inputMethod === 'manual' && (
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            freeSolo
            options={QUICK_SELECT_FOODS}
            value={inputText}
            onChange={(event, newValue) => {
              if (newValue && !compounds.includes(newValue)) {
                onCompoundsChange([...compounds, newValue]);
                setInputText('');
              }
            }}
            onInputChange={(event, newInputValue) => {
              setInputText(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add compound name"
                placeholder="Type or select a compound"
                helperText="Type to search or select from common foods"
              />
            )}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              if (inputText.trim() && !compounds.includes(inputText.trim())) {
                onCompoundsChange([...compounds, inputText.trim()]);
                setInputText('');
              }
            }}
            disabled={!inputText.trim() || compounds.includes(inputText.trim()) || disabled}
          >
            Add Single Compound
          </Button>
        </Box>
      )}

      {/* Quick Select Chips */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Select (Common Cancer-Fighting Foods):
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {QUICK_SELECT_FOODS.map((food) => (
            <Chip
              key={food}
              label={food}
              onClick={() => handleAddQuickSelect(food)}
              disabled={compounds.includes(food) || disabled}
              color={compounds.includes(food) ? 'primary' : 'default'}
              variant={compounds.includes(food) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {/* Selected Compounds List */}
      {compounds.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Compounds ({compounds.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {compounds.map((compound) => (
              <Chip
                key={compound}
                label={compound}
                onDelete={() => handleRemoveCompound(compound)}
                disabled={disabled}
                color="primary"
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Disease Context (Simplified) */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" gutterBottom>
          Disease Context:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {diseaseContext.disease.replace('_', ' ').replace('hgs', 'HGS')} 
          {diseaseContext.mutations && diseaseContext.mutations.length > 0 && (
            <> • {diseaseContext.mutations.length} mutation(s)</>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          This context will be applied to all compounds in the batch.
        </Typography>
      </Paper>

      {/* Test Button */}
      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrowIcon />}
        onClick={handleTest}
        disabled={compounds.length === 0 || disabled}
        sx={{ minWidth: 200 }}
      >
        Test All ({compounds.length} compounds)
      </Button>
    </Box>
  );
}

