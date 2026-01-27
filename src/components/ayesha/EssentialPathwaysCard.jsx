/**
 * EssentialPathwaysCard Component
 * 
 * Displays essential backup pathways that cancer depends on due to broken pathways.
 * Shows pathway status, drug recommendations, and DepMap confidence boosts.
 * 
 * Props:
 * - essentialPathways: Array of pathway objects with:
 *   - pathway_name: string
 *   - pathway_id: string
 *   - status: "FUNCTIONAL"
 *   - description: string (includes drug recommendations)
 *   - disruption_score: number (DepMap boost, 0.0 - 1.0)
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Paper,
  Box,
  Chip,
} from '@mui/material';
import { CheckCircle, Science } from '@mui/icons-material';

const EssentialPathwaysCard = ({ essentialPathways = [] }) => {
  if (!essentialPathways || essentialPathways.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No essential backup pathways identified
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardHeader
        avatar={<CheckCircle color="success" />}
        title="🎯 Essential Backup Pathways"
        subheader={`${essentialPathways.length} pathway${essentialPathways.length !== 1 ? 's' : ''} cancer depends on`}
      />
      <CardContent>
        <Stack spacing={2}>
          {essentialPathways.map((pathway) => {
            const depmapBoost = pathway.disruption_score || 0;
            const boostPercent = depmapBoost > 0 ? (depmapBoost * 100).toFixed(0) : null;

            return (
              <Paper
                key={pathway.pathway_id}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'success.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'success.main',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Science fontSize="small" color="success" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {pathway.pathway_name}
                  </Typography>
                  <Chip
                    label="FUNCTIONAL"
                    size="small"
                    color="success"
                    sx={{ ml: 'auto', fontWeight: 600 }}
                  />
                </Box>

                {pathway.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {pathway.description}
                  </Typography>
                )}

                {boostPercent && depmapBoost > 0 && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Chip
                      label={`+${boostPercent}% confidence boost`}
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<Science fontSize="small" />}
                    />
                    <Typography variant="caption" color="text.secondary">
                      (DepMap lineage validation)
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <strong>What this means:</strong> When primary pathways are broken, cancer cells become dependent on backup pathways. Targeting these backups creates synthetic lethality opportunities.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EssentialPathwaysCard;
