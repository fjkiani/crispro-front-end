/**
 * TherapyFitPage Component
 * 
 * Standalone page for universal drug efficacy ranking.
 * Works for any cancer type with disease validation and normalization.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import EfficacyPanel from '../features/efficacy/components/EfficacyPanel';
import VariantInputList from '../components/myeloma/VariantInputList';
import ModelSelector from '../components/myeloma/ModelSelector';
import DiseaseSelector from '../components/common/DiseaseSelector';
import SPEFrameworkExplanation from '../components/therapy-fit/SPEFrameworkExplanation';

const API_BASE_URL = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

export default function TherapyFitPage() {
  const [disease, setDisease] = useState('');
  const [normalizedDisease, setNormalizedDisease] = useState(null);
  const [mutations, setMutations] = useState([]);
  const [modelId, setModelId] = useState('evo2_1b');
  const [diseaseWarning, setDiseaseWarning] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle disease validation
  const handleDiseaseValidation = (result) => {
    setValidation(result);
    if (result.isValid) {
      setNormalizedDisease(result.normalized);
      setDiseaseWarning(null);
    } else {
      setNormalizedDisease(result.normalized);
      setDiseaseWarning(
        `Disease "${result.original}" not recognized. Using fallback panel.`
      );
    }
  };

  // Get default model based on disease (would call backend, but for now use evo2_1b)
  const getDefaultModel = (diseaseType) => {
    // In a real implementation, this would call the backend config
    // For now, default to evo2_1b for all diseases
    return 'evo2_1b';
  };

  // Update model when disease changes
  useEffect(() => {
    if (normalizedDisease) {
      const defaultModel = getDefaultModel(normalizedDisease);
      setModelId(defaultModel);
    }
  }, [normalizedDisease]);

  // Handle efficacy data from EfficacyPanel
  const handleEfficacyData = (efficacyData) => {
    // Optional: Store or process efficacy data
    console.log('Efficacy data received:', efficacyData);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Therapy Fit: Drug Efficacy Ranking
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Universal drug ranking for any cancer type using the S/P/E framework
      </Typography>

      {/* S/P/E Framework Explanation */}
      <SPEFrameworkExplanation />

      {/* Input Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Patient Information
        </Typography>
        
        <Stack spacing={3}>
          <DiseaseSelector
            value={disease}
            onChange={setDisease}
            onValidation={handleDiseaseValidation}
            error={error}
            helperText="Select the cancer type for this patient"
          />

          {diseaseWarning && (
            <Alert severity="info">{diseaseWarning}</Alert>
          )}

          <VariantInputList
            value={mutations}
            onChange={setMutations}
          />

          <ModelSelector
            value={modelId}
            onChange={setModelId}
          />
        </Stack>
      </Paper>

      {/* Results Section */}
      {mutations.length > 0 && normalizedDisease && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Drug Rankings
          </Typography>
          <EfficacyPanel
            modelId={modelId}
            mutations={mutations}
            onEfficacyData={handleEfficacyData}
          />
        </Box>
      )}

      {mutations.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Enter mutations above to see drug rankings
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
