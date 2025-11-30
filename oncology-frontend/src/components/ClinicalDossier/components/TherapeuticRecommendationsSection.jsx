import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Tooltip,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  LocalPharmacy,
  Info,
  TrendingUp,
  CheckCircle,
  Warning
} from '@mui/icons-material';

/**
 * TherapeuticRecommendationsSection Component
 * 
 * Displays therapeutic drug recommendations with alignment scores,
 * evidence tiers, and clinical badges
 * 
 * @param {Object} props
 * @param {Array<DrugRecommendation>} props.drugs - Array of drug recommendation objects
 * @param {Function} props.onDrugClick - Callback when drug card is clicked (opens modal)
 */
const TherapeuticRecommendationsSection = ({ drugs = [], onDrugClick }) => {
  // Sort drugs by alignment_score (descending) and take top 5
  const sortedDrugs = [...drugs]
    .sort((a, b) => (b.alignment_score || 0) - (a.alignment_score || 0))
    .slice(0, 5);

  const getEvidenceTierColor = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'SUPPORTED':
        return 'success';
      case 'CONSIDER':
        return 'warning';
      case 'INSUFFICIENT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAlignmentColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'warning';
    return 'error';
  };

  if (!drugs || drugs.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Therapeutic Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No drug recommendations available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LocalPharmacy color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Therapeutic Recommendations
        </Typography>
        <Tooltip title="Drug recommendations ranked by mechanism alignment score. Higher scores indicate better alignment with disrupted pathways.">
          <Info fontSize="small" color="action" sx={{ ml: 1 }} />
        </Tooltip>
      </Box>

      {/* Critical Disclaimer */}
      <Alert 
        severity="info" 
        icon={<Info />}
        sx={{ 
          mb: 3,
          backgroundColor: '#e3f2fd',
          borderLeft: '4px solid #1976d2'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Mechanism Alignment Assessment
        </Typography>
        <Typography variant="caption">
          Alignment scores reflect how well each drug targets the disrupted pathways in this tumor.
          They do <strong>NOT</strong> predict response rates or survival outcomes.
        </Typography>
      </Alert>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing top {sortedDrugs.length} recommendation{sortedDrugs.length !== 1 ? 's' : ''} 
        {drugs.length > 5 && ` (of ${drugs.length} total)`}. 
        Click on any drug card to view detailed information.
      </Typography>

      <Grid container spacing={3}>
        {sortedDrugs.map((drug, index) => {
          const alignmentScore = drug.alignment_score || 0;
          const confidence = drug.confidence || 0;

          return (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transition: 'box-shadow 0.3s'
                  }
                }}
                onClick={() => onDrugClick?.(drug)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {drug.name || 'Unknown Drug'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {drug.class || 'Unknown Class'}
                      </Typography>
                    </Box>
                    <Chip
                      label={`#${index + 1}`}
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Alignment Score - Prominent */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Mechanism Alignment Score
                      </Typography>
                      <Tooltip title="Score reflects how well this drug targets the disrupted pathways. Higher scores indicate better alignment.">
                        <Info fontSize="small" color="action" />
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: `${getAlignmentColor(alignmentScore)}.main`
                        }}
                      >
                        {(alignmentScore * 100).toFixed(0)}%
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={alignmentScore * 100}
                          sx={{
                            height: 10,
                            borderRadius: 1,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: `${getAlignmentColor(alignmentScore)}.main`
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Mechanism */}
                  {drug.mechanism && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Mechanism of Action
                      </Typography>
                      <Typography variant="body2">
                        {drug.mechanism}
                      </Typography>
                    </Box>
                  )}

                  {/* Evidence Tier and Confidence */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={drug.evidence_tier || 'INSUFFICIENT'}
                      color={getEvidenceTierColor(drug.evidence_tier)}
                      size="small"
                      icon={<CheckCircle />}
                    />
                    <Chip
                      label={`Confidence: ${(confidence * 100).toFixed(0)}%`}
                      variant="outlined"
                      size="small"
                      icon={<TrendingUp />}
                    />
                  </Box>

                  {/* Clinical Badges */}
                  {drug.clinical_badges && drug.clinical_badges.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Clinical Evidence
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {drug.clinical_badges.map((badge, badgeIndex) => (
                          <Chip
                            key={badgeIndex}
                            label={badge}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* View Details Button */}
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrugClick?.(drug);
                    }}
                    sx={{ mt: 'auto' }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default TherapeuticRecommendationsSection;
