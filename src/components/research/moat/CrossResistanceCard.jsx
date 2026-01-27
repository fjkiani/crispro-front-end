/**
 * Cross-Resistance Analysis Card Component
 * 
 * Displays cross-resistance risks from prior therapies and alternative recommendations
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
  Divider,
  Alert
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WarningIcon from '@mui/icons-material/Warning';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function CrossResistanceCard({ crossResistance = [] }) {
  if (!crossResistance || crossResistance.length === 0) {
    return null;
  }

  const getRiskColor = (risk) => {
    const riskUpper = risk?.toUpperCase() || '';
    if (riskUpper.includes('HIGH')) return 'error';
    if (riskUpper.includes('MODERATE') || riskUpper.includes('MEDIUM')) return 'warning';
    if (riskUpper.includes('LOW')) return 'info';
    return 'default';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SwapHorizIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Cross-Resistance Analysis</Typography>
          <Chip
            label={`${crossResistance.length} risk${crossResistance.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ ml: 2 }}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Resistance mechanisms from prior therapies that may affect current treatment
        </Typography>

        <List>
          {crossResistance.map((resistance, idx) => {
            const priorDrug = resistance.prior_drug || resistance.drug || 'Unknown drug';
            const mechanism = resistance.resistance_mechanism || resistance.mechanism || 'Unknown mechanism';
            const riskLevel = resistance.risk_level || resistance.risk || 'UNKNOWN';
            const alternatives = resistance.alternatives || resistance.alternative_drugs || [];
            const recommendation = resistance.recommendation || resistance.next_steps || null;

            return (
              <React.Fragment key={idx}>
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.paper',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    '&:hover': {
                      boxShadow: 2,
                      borderColor: getRiskColor(riskLevel) === 'error' ? 'error.main' : 'primary.main'
                    }
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <WarningIcon
                        color={getRiskColor(riskLevel)}
                        fontSize="small"
                      />
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Prior Therapy: {priorDrug}
                        </Typography>
                        <Chip
                          label={riskLevel}
                          size="small"
                          color={getRiskColor(riskLevel)}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Resistance Mechanism:</strong> {mechanism}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Alternatives */}
                  {alternatives.length > 0 && (
                    <Box sx={{ width: '100%', pl: 7, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ArrowForwardIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" color="text.secondary">
                          Alternative Options ({alternatives.length})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {alternatives.map((alt, altIdx) => {
                          const altName = typeof alt === 'string' ? alt : alt.drug || alt.name || 'Unknown';
                          return (
                            <Chip
                              key={altIdx}
                              label={altName}
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<LocalPharmacyIcon />}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* Recommendation */}
                  {recommendation && (
                    <Box sx={{ width: '100%', pl: 7 }}>
                      <Alert severity={getRiskColor(riskLevel) === 'error' ? 'warning' : 'info'} sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Recommendation:</strong> {recommendation}
                        </Typography>
                      </Alert>
                    </Box>
                  )}
                </ListItem>
                {idx < crossResistance.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}















