import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Stack,
  Paper,
  Autocomplete,
  Alert,
  Fade,
  alpha
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Sparkles as SparklesIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

/**
 * HolisticInput Component
 * 
 * Beautiful input interface supporting:
 * - Natural language queries (LLM-powered parsing)
 * - Structured input (manual/quick select)
 * - Intelligent suggestions
 */
export default function HolisticInput({
  mode,
  naturalLanguageQuery,
  onNaturalLanguageChange,
  onNaturalLanguageSubmit,
  compounds,
  onCompoundsChange,
  diseaseContext,
  onDiseaseContextChange,
  onTest,
  disabled = false
}) {
  const [inputText, setInputText] = useState('');
  const [parsing, setParsing] = useState(false);

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

  // Natural language examples
  const NATURAL_LANGUAGE_EXAMPLES = [
    "Test these 10 cancer-fighting foods: green tea, broccoli, papaya, purple potatoes, pomegranates, garlic, ginger, turmeric, berries, and fatty fish",
    "Validate the theory that these compounds fight ovarian cancer: curcumin, resveratrol, and EGCG",
    "Which of these foods help with inflammation: omega-3, vitamin D, and NAC",
    "Test the anti-angiogenic properties of green tea, purple potatoes, and pomegranates"
  ];

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageQuery.trim()) return;
    setParsing(true);
    await onNaturalLanguageSubmit();
    setParsing(false);
  };

  const handlePaste = () => {
    if (!inputText.trim()) return;
    const parsed = inputText
      .split(/[,\n;]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
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

  if (mode === 'natural') {
    return (
      <Box>
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '2px solid',
            borderColor: alpha('#667eea', 0.2),
            mb: 3
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <AutoAwesomeIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Natural Language Input
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Describe your hypothesis in plain English. AI will extract compounds and test them automatically.
              </Typography>
            </Box>
          </Stack>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe your hypothesis or theory"
            placeholder="Example: Test these 10 cancer-fighting foods: green tea, broccoli, papaya, purple potatoes, pomegranates, garlic, ginger, turmeric, berries, and fatty fish"
            value={naturalLanguageQuery}
            onChange={(e) => onNaturalLanguageChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleNaturalLanguageSubmit()}
            disabled={disabled || parsing}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }
            }}
            InputProps={{
              startAdornment: parsing && (
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon sx={{ color: 'primary.main', animation: 'pulse 2s infinite' }} />
                </Box>
              )
            }}
            helperText="Press Ctrl+Enter to submit, or click the button below"
          />

          {/* Example Queries */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>
              Try these examples:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {NATURAL_LANGUAGE_EXAMPLES.map((example, index) => (
                <Chip
                  key={index}
                  label={example.slice(0, 50) + '...'}
                  onClick={() => onNaturalLanguageChange(example)}
                  size="small"
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha('#667eea', 0.1),
                      borderColor: 'primary.main'
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={parsing ? <SparklesIcon /> : <AutoAwesomeIcon />}
            onClick={handleNaturalLanguageSubmit}
            disabled={!naturalLanguageQuery.trim() || disabled || parsing}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            {parsing ? 'Parsing with AI...' : 'Parse & Test Hypothesis'}
          </Button>
        </Paper>
      </Box>
    );
  }

  // Structured Input Mode
  return (
    <Box>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          mb: 3
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Structured Input
        </Typography>

        {/* Paste Method */}
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
            sx={{ borderRadius: 2 }}
          >
            Add to List
          </Button>
        </Box>

        {/* Quick Select */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
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
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: compounds.includes(food) ? 'none' : 'scale(1.05)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Selected Compounds */}
        {compounds.length > 0 && (
          <Fade in>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
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
                    sx={{
                      fontSize: '0.95rem',
                      fontWeight: 500
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Fade>
        )}

        {/* Disease Context */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Disease Context:</strong> {diseaseContext.disease.replace('_', ' ').replace('hgs', 'HGS')}
            {diseaseContext.mutations && diseaseContext.mutations.length > 0 && (
              <> • {diseaseContext.mutations.length} mutation(s)</>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This context will be applied to all compounds in the batch.
          </Typography>
        </Alert>

        {/* Test Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<SparklesIcon />}
          onClick={onTest}
          disabled={compounds.length === 0 || disabled}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
            }
          }}
        >
          Test All ({compounds.length} compounds)
        </Button>
      </Paper>
    </Box>
  );
}







