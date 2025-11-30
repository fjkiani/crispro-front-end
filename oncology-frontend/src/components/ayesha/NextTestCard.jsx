/**
 * Next-Test Recommender Card
 * 
 * Displays prioritized biomarker testing recommendations with:
 * - Test name and priority
 * - Urgency badge (HIGH/MEDIUM/LOW)
 * - Rationale
 * - Differential branches (If + → X; If - → Y)
 * - Turnaround time
 * - CTA to order tests
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
  List,
  ListItem,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const NextTestCard = ({ recommendations = [] }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No test recommendations available at this time.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Show top 3 recommendations (Manager's policy: focus)
  const topRecommendations = recommendations.slice(0, 3);

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getUrgencyLabel = (urgency) => {
    return urgency?.toUpperCase() || 'MEDIUM';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ScienceIcon color="primary" />
          <Typography variant="h6">
            📋 Recommended Next Steps
          </Typography>
        </Box>

        <List dense>
          {topRecommendations.map((rec, index) => (
            <ListItem
              key={index}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                mb: 2,
                pb: 2,
                borderBottom: index < topRecommendations.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              {/* Priority + Test Name + Urgency Badge */}
              <Box display="flex" alignItems="center" gap={1} width="100%" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  {rec.priority || index + 1}.
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
                  {rec.test_name || 'Unknown Test'}
                </Typography>
                <Chip
                  label={getUrgencyLabel(rec.urgency)}
                  size="small"
                  color={getUrgencyColor(rec.urgency)}
                />
              </Box>

              {/* Rationale */}
              {rec.rationale && (
                <Box mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    ✓ <strong>Rationale:</strong> {rec.rationale}
                  </Typography>
                </Box>
              )}

              {/* Differential Branches */}
              {(rec.impact_if_positive || rec.impact_if_negative) && (
                <Alert severity="info" sx={{ width: '100%', mb: 1 }}>
                  <Typography variant="body2" component="div">
                    <strong>Differential Branches:</strong>
                    <br />
                    {rec.impact_if_positive && (
                      <>If <strong>+</strong> → {rec.impact_if_positive}</>
                    )}
                    {rec.impact_if_positive && rec.impact_if_negative && ' • '}
                    {rec.impact_if_negative && (
                      <>If <strong>-</strong> → {rec.impact_if_negative}</>
                    )}
                  </Typography>
                </Alert>
              )}

              {/* Turnaround Time */}
              {rec.turnaround_days && (
                <Typography variant="caption" color="text.secondary">
                  ✓ <strong>Turnaround:</strong> {rec.turnaround_days} days
                  {rec.cost_estimate && ` • ${rec.cost_estimate}`}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>

        {/* CTA Button */}
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              // Navigate to NGS Fast-Track section (or scroll to it)
              const ngsSection = document.getElementById('ngs-fast-track');
              if (ngsSection) {
                ngsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Order Tests
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NextTestCard;







