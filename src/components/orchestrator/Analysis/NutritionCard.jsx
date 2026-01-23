/**
 * NutritionCard Component
 * 
 * Displays nutrition and supportive care recommendations.
 * Modular, self-contained component.
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Restaurant,
  CheckCircle,
  Cancel,
  Warning,
} from '@mui/icons-material';

export const NutritionCard = ({ nutritionPlan, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Loading nutrition plan...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!nutritionPlan) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No nutrition plan available</Typography>
        </CardContent>
      </Card>
    );
  }

  const supplements = nutritionPlan.supplements || [];
  const foodsToPrioritize = nutritionPlan.foods_to_prioritize || [];
  const foodsToAvoid = nutritionPlan.foods_to_avoid || [];
  const interactions = nutritionPlan.drug_food_interactions || [];
  const timingRules = nutritionPlan.timing_rules || {};

  const getEvidenceColor = (level) => {
    if (level === 'HIGH' || level === 'STRONG') return 'success';
    if (level === 'MODERATE') return 'warning';
    return 'default';
  };

  return (
    <Card>
      <CardHeader
        avatar={<Restaurant />}
        title="Nutrition & Supportive Care"
        subheader={`Treatment: ${nutritionPlan.treatment || 'Unknown'}`}
      />
      <CardContent>
        {/* Supplements */}
        {supplements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recommended Supplements ({supplements.length})
            </Typography>
            <List>
              {supplements.map((supplement, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {supplement.name}
                        </Typography>
                        {supplement.dosage && (
                          <Chip label={supplement.dosage} size="small" variant="outlined" />
                        )}
                        {supplement.evidence_level && (
                          <Chip
                            label={supplement.evidence_level}
                            size="small"
                            color={getEvidenceColor(supplement.evidence_level)}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {supplement.mechanism && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Mechanism: {supplement.mechanism}
                          </Typography>
                        )}
                        {supplement.timing && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Timing: {supplement.timing}
                          </Typography>
                        )}
                        {supplement.llm_rationale && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {supplement.llm_rationale}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Foods to Prioritize */}
        {foodsToPrioritize.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              <CheckCircle color="success" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Foods to Prioritize
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {foodsToPrioritize.map((food, idx) => (
                <Chip
                  key={idx}
                  label={`${food.food} - ${food.reason}`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Foods to Avoid */}
        {foodsToAvoid.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              <Cancel color="error" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Foods to Avoid
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {foodsToAvoid.map((food, idx) => (
                <Chip
                  key={idx}
                  label={`${food.food} - ${food.reason}`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Drug-Food Interactions */}
        {interactions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              <Warning color="warning" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Drug-Food Interactions ({interactions.length})
            </Typography>
            {interactions.map((interaction, idx) => (
              <Alert
                key={idx}
                severity={interaction.severity === 'HIGH' ? 'error' : 'warning'}
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {interaction.drug} + {interaction.food}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {interaction.mechanism}
                </Typography>
                {interaction.interaction_type && (
                  <Chip
                    label={interaction.interaction_type}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Alert>
            ))}
          </Box>
        )}

        {/* Timing Rules */}
        {Object.keys(timingRules).length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Timing Rules
            </Typography>
            <List dense>
              {Object.entries(timingRules).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemText
                    primary={key}
                    secondary={value}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

