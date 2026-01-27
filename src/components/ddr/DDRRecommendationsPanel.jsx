/**
 * DDRRecommendationsPanel Component
 * 
 * Displays treatment recommendations based on DDR status.
 */
import React from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Alert, Chip } from '@mui/material';
import { CheckCircle, Warning, Info } from '@mui/icons-material';

const DDRRecommendationsPanel = ({ ddrStatus }) => {
  if (!ddrStatus) return null;

  const status = ddrStatus.DDR_bin_status;

  const getRecommendations = (status) => {
    switch (status) {
      case 'DDR_defective':
        return {
          severity: 'success',
          title: 'PARP Inhibitor Eligible',
          recommendations: [
            {
              type: 'primary',
              text: 'Consider PARP inhibitor therapy (olaparib, niraparib, rucaparib)',
              evidence: 'High - DDR deficiency is a validated biomarker for PARP inhibitor response'
            },
            {
              type: 'secondary',
              text: 'Platinum-based chemotherapy may be more effective',
              evidence: 'Moderate - DDR deficiency associated with platinum sensitivity'
            },
            {
              type: 'monitoring',
              text: 'Monitor for treatment response and resistance patterns',
              evidence: 'Standard'
            }
          ]
        };
      case 'DDR_proficient':
        return {
          severity: 'info',
          title: 'Standard Treatment Options',
          recommendations: [
            {
              type: 'primary',
              text: 'Standard chemotherapy regimens are appropriate',
              evidence: 'Standard'
            },
            {
              type: 'secondary',
              text: 'PARP inhibitors may have limited efficacy',
              evidence: 'Moderate - DDR proficiency associated with PARP inhibitor resistance'
            },
            {
              type: 'monitoring',
              text: 'Consider alternative targeted therapies based on other biomarkers',
              evidence: 'Standard'
            }
          ]
        };
      case 'unknown':
      default:
        return {
          severity: 'warning',
          title: 'Insufficient Data',
          recommendations: [
            {
              type: 'primary',
              text: 'Additional genomic testing recommended to determine DDR status',
              evidence: 'Standard'
            },
            {
              type: 'secondary',
              text: 'Consider comprehensive NGS panel with HRD assessment',
              evidence: 'Standard'
            },
            {
              type: 'monitoring',
              text: 'Treatment decisions should be based on other available biomarkers',
              evidence: 'Standard'
            }
          ]
        };
    }
  };

  const config = getRecommendations(status);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Info color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Treatment Recommendations
          </Typography>
        </Box>

        <Alert severity={config.severity} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {config.title}
          </Typography>
        </Alert>

        <List>
          {config.recommendations.map((rec, idx) => (
            <ListItem key={idx} sx={{ px: 0, py: 1 }}>
              <ListItemIcon>
                {rec.type === 'primary' ? (
                  <CheckCircle color="primary" />
                ) : rec.type === 'secondary' ? (
                  <Warning color="warning" />
                ) : (
                  <Info color="info" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: rec.type === 'primary' ? 600 : 400 }}>
                      {rec.text}
                    </Typography>
                    <Chip
                      label={rec.evidence}
                      size="small"
                      sx={{ mt: 0.5, fontSize: '0.7rem' }}
                      color={rec.type === 'primary' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Research Use Only:</strong> These recommendations are for research purposes only and should not be used for clinical decision-making without consultation with a qualified oncologist.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DDRRecommendationsPanel;
