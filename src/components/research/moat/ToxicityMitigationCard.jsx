/**
 * Toxicity Mitigation Card Component
 * 
 * Displays toxicity risk level, pathway overlap, and mitigating food recommendations
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Alert,
  AlertTitle
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ToxicityMitigationCard({ toxicityMitigation }) {
  if (!toxicityMitigation) {
    return null;
  }

  const riskLevel = toxicityMitigation.risk_level || toxicityMitigation.risk || 'UNKNOWN';
  const pathwayOverlap = toxicityMitigation.pathway_overlap || toxicityMitigation.overlap_score || 0;
  const mitigatingFoods = toxicityMitigation.mitigating_foods || toxicityMitigation.foods || [];
  const alerts = toxicityMitigation.alerts || toxicityMitigation.warnings || [];

  const getRiskColor = (risk) => {
    const riskUpper = risk?.toUpperCase() || '';
    if (riskUpper.includes('HIGH')) return 'error';
    if (riskUpper.includes('MODERATE') || riskUpper.includes('MEDIUM')) return 'warning';
    if (riskUpper.includes('LOW')) return 'success';
    return 'default';
  };

  const getRiskSeverity = (risk) => {
    const riskUpper = risk?.toUpperCase() || '';
    if (riskUpper.includes('HIGH')) return 'error';
    if (riskUpper.includes('MODERATE') || riskUpper.includes('MEDIUM')) return 'warning';
    return 'info';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Toxicity Risk & Mitigation</Typography>
        </Box>

        {/* Risk Level */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Toxicity Risk Level
          </Typography>
          <Chip
            label={riskLevel}
            color={getRiskColor(riskLevel)}
            sx={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              height: 32
            }}
          />
        </Box>

        {/* Pathway Overlap */}
        {pathwayOverlap !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Pathway Overlap
            </Typography>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <AccountTreeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>{(pathwayOverlap * 100).toFixed(0)}%</strong> overlap between patient variants and drug MoA pathways
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Mitigating Foods */}
        {mitigatingFoods.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <RestaurantIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Mitigating Foods ({mitigatingFoods.length})
              </Typography>
            </Box>
            <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {mitigatingFoods.map((food, idx) => {
                  const foodName = typeof food === 'string' ? food : food.name || food.food || 'Unknown';
                  return (
                    <Chip
                      key={idx}
                      label={foodName}
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<RestaurantIcon />}
                    />
                  );
                })}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Alerts/Warnings */}
        {alerts.length > 0 && (
          <Box>
            {alerts.map((alert, idx) => {
              const alertText = typeof alert === 'string' ? alert : alert.message || alert.text || 'Unknown alert';
              const alertSeverity = typeof alert === 'object' && alert.severity
                ? alert.severity.toLowerCase()
                : getRiskSeverity(riskLevel);

              return (
                <Alert
                  key={idx}
                  severity={alertSeverity}
                  sx={{ mb: 1 }}
                  icon={<WarningIcon />}
                >
                  <AlertTitle>{alertSeverity === 'error' ? 'High Risk' : 'Warning'}</AlertTitle>
                  {alertText}
                </Alert>
              );
            })}
          </Box>
        )}

        {/* No Risk Message */}
        {riskLevel?.toUpperCase().includes('LOW') && mitigatingFoods.length === 0 && alerts.length === 0 && (
          <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon />
              <Typography variant="body2">
                Low toxicity risk detected. Standard monitoring recommended.
              </Typography>
            </Box>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}















