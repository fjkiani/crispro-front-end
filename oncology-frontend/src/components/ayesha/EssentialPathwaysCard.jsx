/**
 * EssentialPathwaysCard Component
 * 
 * Displays essential backup pathways that cancer depends on due to broken pathways.
 * Redesigned for high readability and clear hierarchy (Cause -> Dependency -> Action).
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
  Divider,
  Button
} from '@mui/material';
import { CheckCircle, VerifiedUser, Science, ArrowForward } from '@mui/icons-material';

const EssentialPathwaysCard = ({ essentialPathways = [] }) => {
  // Empty State
  if (!essentialPathways || essentialPathways.length === 0) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', jc: 'center', alignItems: 'center', opacity: 0.7 }}>
          <VerifiedUser sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
            No Critical Dependencies Detected
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1, maxWidth: 250 }}>
            The tumor does not currently exhibit clear dependency on specific backup pathways.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Science color="primary" sx={{ color: '#059669' }} /> {/* Emerald 600 */}
            <Typography variant="h6" fontWeight={700} sx={{ color: '#064e3b' }}> {/* Emerald 900 */}
              Critical Dependencies
            </Typography>
          </Box>
        }
        subheader={<Typography variant="caption" color="text.secondary">Pathways keeping the tumor alive</Typography>}
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Stack spacing={2}>
          {essentialPathways.map((pathway, idx) => {
            const depmapBoost = pathway.disruption_score || 0;
            const boostPercent = depmapBoost > 0 ? (depmapBoost * 100).toFixed(0) : null;

            // Extract Drug Targets from description if possible (simple heuristic)
            // Expecting strings like "Targetable with: Olaparib"
            const descriptionParts = pathway.description ? pathway.description.split('Targetable with:') : [pathway.description, ''];
            const contextText = descriptionParts[0];
            const drugsText = descriptionParts[1] ? descriptionParts[1].trim() : null;

            return (
              <Paper
                key={pathway.pathway_id || idx}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  border: '1px solid',
                  borderColor: '#e5e7eb', // gray-200
                  borderLeft: '4px solid',
                  borderLeftColor: '#059669', // Emerald 600
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }
                }}
              >
                {/* Header: Name + Badge */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {pathway.pathway_name}
                  </Typography>
                  <Chip
                    label="FUNCTIONAL"
                    size="small"
                    sx={{
                      bgcolor: '#ecfdf5', // emerald-50
                      color: '#059669',   // emerald-600
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>

                {/* Context: The 'Why' */}
                <Typography variant="body2" sx={{ color: '#374151', mb: 1.5, lineHeight: 1.5 }}> {/* gray-700 */}
                  {contextText}
                </Typography>

                {/* Action: The Drug Target */}
                {drugsText && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: '#f0fdf4', // emerald-50
                      border: '1px dashed',
                      borderColor: '#10b981' // emerald-500
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#047857', textTransform: 'uppercase' }}>
                      TARGET WITH
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: '#10b981' }} />
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#065f46' }}>
                      {drugsText}
                    </Typography>
                  </Box>
                )}

                {/* Validation Badge (DepMap) */}
                {boostPercent && depmapBoost > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
                    <CheckCircle sx={{ fontSize: 14, color: '#059669' }} />
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 500 }}>
                      Validated by DepMap (+{boostPercent}% confidence)
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EssentialPathwaysCard;
