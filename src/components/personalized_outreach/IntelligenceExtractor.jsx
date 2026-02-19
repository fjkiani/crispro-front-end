import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { API_ROOT } from '../../lib/apiConfig';


const IntelligenceExtractor = ({ nctId, onIntelligence }) => {
  const [nctIdInput, setNctIdInput] = useState(nctId || '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [intelligence, setIntelligence] = useState(null);

  const handleExtract = async () => {
    if (!nctIdInput) {
      setError('NCT ID is required');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setIntelligence(null);

    try {
      const response = await fetch(`${API_ROOT}/api/personalized-outreach/extract-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nct_id: nctIdInput }),
      });

      if (!response.ok) {
        throw new Error(`Extraction failed: ${response.status}`);
      }

      const data = await response.json();
      setIntelligence(data);
      if (onIntelligence) {
        onIntelligence(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PsychologyIcon color="primary" />
          <Typography variant="h6">Extract Intelligence</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="NCT ID"
            value={nctIdInput}
            onChange={(e) => setNctIdInput(e.target.value)}
            placeholder="NCT01234567"
            disabled={isExtracting}
          />
          <Button
            variant="contained"
            onClick={handleExtract}
            disabled={isExtracting || !nctIdInput}
            sx={{ minWidth: 150 }}
          >
            {isExtracting ? <CircularProgress size={20} /> : 'Extract'}
          </Button>
        </Box>

        {isExtracting && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Extracting trial intelligence, research focus, and biomarker fit...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {intelligence && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Intelligence Profile</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={`Quality: ${(intelligence.personalization_quality * 100).toFixed(0)}%`}
                color={intelligence.personalization_quality >= 0.7 ? 'success' : 'warning'}
              />
              {intelligence.trial_intelligence?.pi_info?.name && (
                <Chip label={`PI: ${intelligence.trial_intelligence.pi_info.name}`} />
              )}
              {intelligence.biomarker_intelligence?.kelim_fit_score && (
                <Chip
                  label={`KELIM Fit: ${intelligence.biomarker_intelligence.kelim_fit_score.toFixed(1)}`}
                  color="primary"
                />
              )}
            </Box>

            {intelligence.goals && intelligence.goals.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">PI Goals:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {intelligence.goals.map((goal, idx) => (
                    <Chip key={idx} label={goal} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {intelligence.value_proposition && intelligence.value_proposition.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">Value Proposition:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {intelligence.value_proposition.map((prop, idx) => (
                    <Chip key={idx} label={prop} size="small" color="primary" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligenceExtractor;
