/**
 * DDRFeatureBreakdown Component
 * 
 * Shows which DDR rules fired and contributed to the classification.
 */
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle, Cancel, HelpOutline } from '@mui/icons-material';

const DDRFeatureBreakdown = ({ ddrStatus }) => {
  if (!ddrStatus) return null;

  const features = [
    {
      label: 'BRCA Pathogenic',
      value: ddrStatus.BRCA_pathogenic,
      priority: 1,
      description: 'Pathogenic variants in BRCA1 or BRCA2'
    },
    {
      label: 'Core HRR Pathogenic',
      value: ddrStatus.core_HRR_pathogenic,
      priority: 2,
      description: 'Pathogenic variants in core HRR genes (PALB2, RAD51C, RAD51D, etc.)'
    },
    {
      label: 'Extended DDR Pathogenic',
      value: ddrStatus.extended_DDR_pathogenic,
      priority: 3,
      description: 'Pathogenic variants in extended DDR pathway genes'
    },
  ];

  const hrdStatus = ddrStatus.HRD_status_inferred;
  const featuresUsed = ddrStatus.DDR_features_used || [];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          DDR Feature Breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Priority-ordered rules that contributed to classification
        </Typography>

        <Box sx={{ mt: 2 }}>
          <List>
            {features.map((feature, idx) => (
              <ListItem key={idx} sx={{ px: 0 }}>
                <ListItemIcon>
                  {feature.value ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Cancel color="disabled" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" sx={{ fontWeight: feature.value ? 600 : 400 }}>
                        {feature.label}
                      </Typography>
                      {feature.value && (
                        <Chip label={`Priority ${feature.priority}`} size="small" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={feature.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {hrdStatus && hrdStatus !== 'unknown' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              HRD Status (Inferred)
            </Typography>
            <Chip
              label={hrdStatus.replace('_', ' ').toUpperCase()}
              color={hrdStatus === 'HRD_positive' ? 'error' : 'success'}
              size="small"
            />
            {ddrStatus.HRD_score_raw && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                Score: {ddrStatus.HRD_score_raw.toFixed(2)}
              </Typography>
            )}
          </Box>
        )}

        {featuresUsed.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Features Used: {featuresUsed.join(', ')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DDRFeatureBreakdown;
