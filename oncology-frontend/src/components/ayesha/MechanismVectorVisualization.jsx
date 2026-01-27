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
  mechanismVector = [0.88, 0.12, 0.15, 0.10, 0.05, 0.2, 0.0],
  mutations = []
}) => {
  if (!mechanismVector || mechanismVector.length !== 7) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Mechanism vector data unavailable</Typography>
        </CardContent>
      </Card>
    );
  }

  // Find highest pathway (for highlighting)
  const maxValue = Math.max(...mechanismVector);
  const maxIndex = mechanismVector.indexOf(maxValue);
  const maxPathway = PATHWAY_LABELS[maxIndex];

  // Build mutation summary
  const mutationSummary = mutations.length > 0
    ? mutations.map(m => `${m.gene}${m.variant ? ` (${m.variant})` : ''}`).join(', ')
    : 'No mutations provided';

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardHeader
        avatar={<Science color="primary" sx={{ fontSize: { xs: 28, sm: 40 } }} />}
        title={
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            🧬 Mechanism Profile
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            7D Pathway Vector
          </Typography>
        }
        action={
          <Tooltip title="Mechanism vector represents pathway disruptions. Higher values indicate stronger pathway involvement.">
            <Info fontSize="small" color="action" sx={{ cursor: 'help', display: { xs: 'none', sm: 'block' } }} />
          </Tooltip>
        }
        sx={{ pb: { xs: 1, sm: 2 } }}
      />
      <CardContent>
        <Stack spacing={2}>
          {/* Pathway Bars */}
          {PATHWAY_LABELS.map((pathway, index) => {
            const value = mechanismVector[index] || 0;
            const isHighlighted = index === maxIndex;
            const percent = (value * 100).toFixed(0);

            return (
              <Box key={pathway.id}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" fontWeight={isHighlighted ? 600 : 400}>
                    {pathway.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      {percent}%
                    </Typography>
                    {isHighlighted && value >= 0.7 && (
                      <Chip
                        label="VERY HIGH"
                        size="small"
                        color={pathway.color}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    {isHighlighted && value >= 0.7 && pathway.id === 'DDR' && (
                      <Chip
                        label="PARP Eligible"
                        size="small"
                        color="error"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={value * 100}
                  color={isHighlighted ? pathway.color : 'default'}
                  sx={{
                    height: isHighlighted ? 12 : 8,
                    borderRadius: 1,
                    bgcolor: isHighlighted ? `${pathway.color}.lighter` : 'grey.200',
                  }}
                />
              </Box>
            );
          })}

          {/* Mutation Summary */}
          {mutations.length > 0 && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Based on mutations:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                {mutations.map((mutation, idx) => (
                  <Chip
                    key={idx}
                    label={`${mutation.gene}${mutation.variant ? ` ${mutation.variant}` : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
              {maxPathway.id === 'DDR' && maxValue >= 0.7 && (
                <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1, fontWeight: 500 }}>
                  DDR-high profile → PARP inhibitor eligible
                </Typography>
              )}
            </Box>
          )}

          {/* Default Ayesha Message (if no mutations provided) */}
          {mutations.length === 0 && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Default DDR-high profile for Ayesha (MBD4 + TP53)
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MechanismVectorVisualization;
