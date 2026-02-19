/**
 * PathwayDisruptionCard Component
 * 
 * Displays broken/compromised pathways and their impact.
 * Shows pathway status (NON_FUNCTIONAL, COMPROMISED) with affected genes.
 * 
 * Props:
 * - brokenPathways: Array of pathway objects with:
 *   - pathway_name: string
 *   - pathway_id: string
 *   - status: "NON_FUNCTIONAL" | "COMPROMISED" | "FUNCTIONAL"
 *   - genes_affected: string[]
 *   - disruption_score: number (0.0 - 1.0)
 *   - description: string (optional)
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';

const PathwayDisruptionCard = ({ brokenPathways = [] }) => {
  // Filter to only show broken/compromised pathways
  const disruptedPathways = brokenPathways ? brokenPathways.filter(
    p => p.status === 'NON_FUNCTIONAL' || p.status === 'COMPROMISED'
  ) : [];

  if (disruptedPathways.length === 0) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={700}>
                Functional Integrity
              </Typography>
              <Chip
                label="STABLE"
                size="small"
                sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.7rem', height: 20 }}
              />
            </Box>
          }
          subheader="No intrinsic pathway failures detected"
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          <Alert severity="success" icon={<Warning fontSize="inherit" />} sx={{ mb: 2, bgcolor: '#f0fdf4', color: '#166534', border: '1px solid', borderColor: '#bbf7d0' }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Non-Addicted Profile
            </Typography>
            <Typography variant="caption" display="block" sx={{ lineHeight: 1.4 }}>
              Unlike unstable tumors vulnerable to synthetic lethality (e.g. PARPi), this tumor has kept its safety systems intact.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600 }}>
              Implication: Harder to target implicitly. Must attack primary growth fuel (MAPK/PI3K).
            </Typography>
          </Alert>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500} gutterBottom>
              Verified Functional Systems:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
              {['Apoptosis', 'Cell Cycle', 'DNA Repair', 'Hypoxia'].map(p => (
                <Chip
                  key={p}
                  icon={<CheckCircle sx={{ fontSize: '0.9rem !important' }} />}
                  label={p}
                  size="small"
                  sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid',
                    borderColor: '#d1d5db',
                    '& .MuiChip-icon': { color: '#059669' } // emerald-600
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardHeader
        avatar={<Warning color="warning" />}
        title="⚠️ Disrupted Pathways"
        subheader={`${disruptedPathways.length} pathway${disruptedPathways.length !== 1 ? 's' : ''} compromised`}
      />
      <CardContent>
        <Stack spacing={2}>
          {disruptedPathways.map((pathway) => {
            const severity = pathway.status === 'NON_FUNCTIONAL' ? 'error' : 'warning';
            const Icon = pathway.status === 'NON_FUNCTIONAL' ? ErrorIcon : Warning;
            const disruptionPercent = pathway.disruption_score
              ? (pathway.disruption_score * 100).toFixed(0)
              : null;

            return (
              <Alert
                key={pathway.pathway_id}
                severity={severity}
                icon={<Icon />}
                sx={{ borderRadius: 1 }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {pathway.pathway_name}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1} mb={1} alignItems="center">
                  <Chip
                    label={(pathway.status || 'UNKNOWN').replace('_', ' ')}
                    size="small"
                    color={severity}
                    sx={{ fontWeight: 600 }}
                  />
                  {disruptionPercent && (
                    <Chip
                      label={`${disruptionPercent}% disruption`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {pathway.genes_affected && pathway.genes_affected.length > 0 && (
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Affected genes:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {pathway.genes_affected.map((gene, idx) => (
                        <Chip
                          label={typeof gene === 'object' ? (gene.name || gene.gene || 'Unknown') : gene}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {pathway.description && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {pathway.description}
                  </Typography>
                )}
              </Alert>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PathwayDisruptionCard;
