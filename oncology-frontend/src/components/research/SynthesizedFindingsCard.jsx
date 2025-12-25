/**
 * Synthesized Findings Card Component
 * 
 * Displays LLM-synthesized findings from Research Intelligence:
 * - Mechanisms list (with targets)
 * - Evidence summary (LLM-generated)
 * - Overall confidence score
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TargetIcon from '@mui/icons-material/GpsFixed';

export default function SynthesizedFindingsCard({ findings }) {
  if (!findings) {
    return null;
  }

  const mechanisms = findings.mechanisms || [];
  const evidenceSummary = findings.evidence_summary || findings.summary || '';
  const overallConfidence = findings.overall_confidence || findings.confidence || 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Synthesized Findings</Typography>
        </Box>

        {/* Overall Confidence */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Overall Confidence
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {(overallConfidence * 100).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallConfidence * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: overallConfidence >= 0.7 ? 'success.main' : 
                                 overallConfidence >= 0.5 ? 'warning.main' : 'error.main'
              }
            }}
          />
        </Box>

        {/* Evidence Summary */}
        {evidenceSummary && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Evidence Summary
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderLeft: 3,
                borderColor: 'primary.main'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {evidenceSummary}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Mechanisms */}
        {mechanisms.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Mechanisms Discovered ({mechanisms.length})
            </Typography>
            <List>
              {mechanisms.map((mech, idx) => {
                const mechanismName = mech.mechanism || mech.name || mech || 'Unknown';
                const target = mech.target || mech.targets?.[0] || null;
                const confidence = mech.confidence || mech.confidence_score || null;

                return (
                  <ListItem
                    key={idx}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {mechanismName}
                          </Typography>
                          {confidence !== null && (
                            <Chip
                              label={`${(confidence * 100).toFixed(0)}%`}
                              size="small"
                              color={confidence >= 0.7 ? 'success' : confidence >= 0.5 ? 'warning' : 'default'}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        target ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <TargetIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Target: {target}
                            </Typography>
                          </Box>
                        ) : null
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {mechanisms.length === 0 && !evidenceSummary && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No synthesized findings available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}




