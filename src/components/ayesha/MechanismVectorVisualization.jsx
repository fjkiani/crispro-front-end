/**
 * MechanismVectorVisualization Component
 * 
 * Displays patient's 7D mechanism vector profile with pathway breakdown.
 * Shows DDR-high profile for Ayesha (MBD4 + TP53 → DDR=0.88).
 * 
 * Props:
 * - mechanismVector: [DDR, MAPK, PI3K, VEGF, HER2, IO, Efflux] (7D array)
 * - mutations: Array of mutation objects with gene and variant
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import { Science, Info } from '@mui/icons-material';

const PATHWAY_LABELS = [
  { id: 'DDR', name: 'DNA Damage Response (DDR)', color: 'error' },
  { id: 'MAPK', name: 'MAPK Signaling', color: 'warning' },
  { id: 'PI3K', name: 'PI3K/AKT Pathway', color: 'info' },
  { id: 'VEGF', name: 'VEGF/Angiogenesis', color: 'primary' },
  { id: 'HER2', name: 'HER2 Signaling', color: 'secondary' },
  { id: 'IO', name: 'Immune Checkpoint', color: 'success' },
  { id: 'Efflux', name: 'Drug Efflux', color: 'default' },
];

const MechanismVectorVisualization = ({
  mechanismVector, // No default - strict contract
  mutations = [],
  isEstimated = false,
  provenance = null // New prop for audit trail
}) => {
  // Strict check: Must be 7D array
  if (!mechanismVector || !Array.isArray(mechanismVector) || mechanismVector.length !== 7) {
    return (
      <Card elevation={0} variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography color="text.secondary" gutterBottom>
            Mechanism Data Unavailable
          </Typography>
          <Typography variant="caption" display="block">
            Insufficient inputs for 7D vector generation.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Find highest pathway (for highlighting)
  const maxValue = Math.max(...mechanismVector);
  const maxIndex = mechanismVector.indexOf(maxValue);
  const maxPathway = PATHWAY_LABELS[maxIndex];

  // Dynamic Interpretation Logic
  let interpretationTitle = "Balanced Signaling Profile";
  let interpretationText = "No single pathway dominates, suggesting multiple functional drivers.";

  if (maxValue >= 0.5) {
    interpretationTitle = `Dominant ${maxPathway.id} Signal Detected`;
    interpretationText = `This tumor is heavily utilizing ${maxPathway.name} pathways, suggesting a critical dependency we can target.`;
  } else if (maxValue >= 0.3) {
    interpretationTitle = `Elevated ${maxPathway.id} Activity`;
    interpretationText = `Moderate reliance on ${maxPathway.name} observed. Combination therapy may be required.`;
  }

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={<Science color="primary" sx={{ fontSize: { xs: 28, sm: 32 } }} />}
        title={
          <Box>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 700 }}>
              Tumor Mechanism Drivers
            </Typography>
            {isEstimated && (
              <Chip
                label="Estimated (Germline)"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 16, mt: 0.5 }}
              />
            )}
          </Box>
        }
        action={
          provenance && (
            <Tooltip title={`Source: ${provenance.run_id || 'API'} (v${provenance.version || '1.0'})`}>
              <Info fontSize="small" color="action" sx={{ cursor: 'help', mt: 1, mr: 1 }} />
            </Tooltip>
          )
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Stack spacing={2}>
          {/* Interpretation Banner */}
          <Alert
            severity={maxValue >= 0.5 ? "error" : "info"}
            icon={maxValue >= 0.5 ? <Science fontSize="inherit" /> : <Info fontSize="inherit" />}
            sx={{
              py: 0.5,
              px: 2,
              '& .MuiAlert-message': { width: '100%' },
              bgcolor: maxValue >= 0.5 ? '#fef2f2' : '#eff6ff',
              color: maxValue >= 0.5 ? '#991b1b' : '#1e3a8a'
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {interpretationTitle}
            </Typography>
            <Typography variant="caption" display="block" sx={{ lineHeight: 1.2, mt: 0.5, opacity: 0.9 }}>
              {interpretationText}
            </Typography>
          </Alert>

          {/* Pathway Bars */}
          <Box>
            {PATHWAY_LABELS.map((pathway, index) => {
              const value = mechanismVector[index] || 0;
              const isHighlighted = index === maxIndex;
              const percent = (value * 100).toFixed(0);

              return (
                <Box key={pathway.id} sx={{ mb: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="caption" fontWeight={isHighlighted ? 700 : 400} color={isHighlighted ? "text.primary" : "text.secondary"}>
                      {pathway.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" fontWeight={600} color={isHighlighted ? "text.primary" : "text.secondary"}>
                        {percent}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={value * 100}
                    color={isHighlighted ? pathway.color : 'inherit'}
                    sx={{
                      height: isHighlighted ? 10 : 6,
                      borderRadius: 4,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: !isHighlighted ? 'grey.400' : undefined
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          {/* Mutation Summary */}
          {mutations.length > 0 && (
            <Box
              sx={{
                mt: 'auto',
                pt: 1.5,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" gutterBottom>
                Driven by Variants:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {mutations.map((mutation, idx) => (
                  <Chip
                    key={idx}
                    label={`${mutation.gene}${mutation.variant ? ` ${mutation.variant}` : ''}`}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MechanismVectorVisualization;
