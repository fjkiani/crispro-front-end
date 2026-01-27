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
import { Warning, Error as ErrorIcon } from '@mui/icons-material';

const PathwayDisruptionCard = ({ brokenPathways = [] }) => {
  if (!brokenPathways || brokenPathways.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No pathway disruptions detected
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Filter to only show broken/compromised pathways
  const disruptedPathways = brokenPathways.filter(
    p => p.status === 'NON_FUNCTIONAL' || p.status === 'COMPROMISED'
  );

  if (disruptedPathways.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            All pathways functional
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardHeader
        avatar={<Warning color="warning" />}
        title="⚠️ Broken Pathways"
        subheader={`${disruptedPathways.length} pathway${disruptedPathways.length !== 1 ? 's' : ''} disrupted`}
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
                    label={pathway.status.replace('_', ' ')}
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
                          key={idx}
                          label={gene}
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
