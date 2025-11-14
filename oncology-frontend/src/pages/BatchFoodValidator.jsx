import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Paper,
  Chip,
  Stack,
  Grid
} from '@mui/material';
import {
  Science as ScienceIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  CompareArrows as CompareArrowsIcon
} from '@mui/icons-material';
import BatchTestInput from '../components/batch/BatchTestInput';
import BatchResultsTable from '../components/batch/BatchResultsTable';
import BatchProgressTracker from '../components/batch/BatchProgressTracker';
import ComparativeAnalysisPanel from '../components/comparison/ComparativeAnalysisPanel';
import { useBatchValidation } from '../hooks/useBatchValidation';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://127.0.0.1:8000';

/**
 * Batch Food Validator
 * 
 * Test multiple foods/compounds simultaneously with:
 * - Shared disease context
 * - Real-time progress tracking
 * - Comparative analysis
 * - Export functionality
 */
export default function BatchFoodValidator() {
  const [compounds, setCompounds] = useState([]);
  const [diseaseContext, setDiseaseContext] = useState({
    disease: 'ovarian_cancer_hgs',
    mutations: [{ gene: 'TP53', hgvs_p: 'R248Q' }],
    biomarkers: { HRD: 'POSITIVE', TMB: 8.2 }
  });
  const [showComparison, setShowComparison] = useState(false);

  const {
    results,
    loading,
    progress,
    error,
    testBatch,
    clearResults,
    exportResults
  } = useBatchValidation();

  const handleTest = async () => {
    if (compounds.length === 0) {
      return;
    }

    await testBatch(compounds, diseaseContext);
  };

  const handleExport = () => {
    exportResults(results, 'batch_food_validation_results');
  };

  const canCompare = results.length >= 2 && !loading;

  return (
    <Box sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" fontSize="large" />
          Batch Food Validator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test multiple foods/compounds simultaneously with shared disease context. Compare results side-by-side and export for analysis.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Research Use Only</strong> - This tool provides evidence-based recommendations but should not replace medical advice.
        </Alert>
      </Box>

      {/* Input Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <BatchTestInput
          compounds={compounds}
          onCompoundsChange={setCompounds}
          diseaseContext={diseaseContext}
          onDiseaseContextChange={setDiseaseContext}
          onTest={handleTest}
          disabled={loading}
        />
      </Card>

      {/* Progress Tracker */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <BatchProgressTracker progress={progress} total={compounds.length} />
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <Box>
          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={results.length === 0}
            >
              Export Results
            </Button>
            <Button
              variant="outlined"
              startIcon={<CompareArrowsIcon />}
              onClick={() => setShowComparison(!showComparison)}
              disabled={!canCompare}
            >
              {showComparison ? 'Hide Comparison' : 'Show Comparison'}
            </Button>
            <Button
              variant="outlined"
              onClick={clearResults}
              disabled={loading}
            >
              Clear Results
            </Button>
          </Stack>

          {/* Comparison Panel */}
          {showComparison && canCompare && (
            <Box sx={{ mb: 3 }}>
              <ComparativeAnalysisPanel results={results} />
            </Box>
          )}

          {/* Results Table */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Results ({results.length} of {compounds.length} complete)
            </Typography>
            <BatchResultsTable results={results} />
          </Card>
        </Box>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No results yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter compounds above and click "Test All" to begin batch validation.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}





