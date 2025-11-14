import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InfoIcon from '@mui/icons-material/Info';

/**
 * FoodRankingPanel - Displays ranked food/supplement recommendations
 * 
 * Props:
 * @param {Array} foods - Array of food recommendation objects
 * @param {Function} onViewDetails - Optional callback when "Details" clicked
 */
export default function FoodRankingPanel({ foods = [], onViewDetails }) {
  if (!foods || foods.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No food/supplement recommendations available.
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <RestaurantIcon color="primary" fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Food/Supplement Support
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {foods.map((food, idx) => (
          <Card key={idx} variant="outlined" sx={{ bgcolor: idx === 0 ? 'success.50' : 'white' }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {idx + 1}. {food.compound}
                  </Typography>
                  {food.pathways && food.pathways.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                      {food.pathways.slice(0, 3).map((pathway, pidx) => (
                        <Chip
                          key={pidx}
                          label={pathway}
                          size="small"
                          variant="outlined"
                          color="success"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {Math.round((food.efficacy_score || 0) * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Confidence: {Math.round((food.confidence || 0) * 100)}%
                  </Typography>
                </Box>
              </Box>

              {/* Score Bar */}
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(food.efficacy_score || 0) * 100}
                  color="success"
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>

              {/* Dosage */}
              {food.dosage && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Recommended Dosage:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {food.dosage}
                  </Typography>
                </Box>
              )}

              {/* Rationale */}
              {food.rationale && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {food.rationale}
                </Typography>
              )}

              {/* SAE Features */}
              {food.sae_features && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Treatment Line Intelligence
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {food.sae_features.line_fitness && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Line Fitness
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {Math.round(food.sae_features.line_fitness.score * 100)}%
                          </Typography>
                        </Box>
                      )}
                      {food.sae_features.cross_resistance && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Cross-Resistance Risk
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {food.sae_features.cross_resistance.risk}
                          </Typography>
                        </Box>
                      )}
                      {food.sae_features.sequencing_fitness && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Sequencing Fit
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {food.sae_features.sequencing_fitness.optimal ? 'YES' : 'NO'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Citations */}
              {food.citations && food.citations.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Citations: {food.citations.slice(0, 3).map(pmid => (
                      <a
                        key={pmid}
                        href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '8px', color: 'inherit' }}
                      >
                        PMID:{pmid}
                      </a>
                    ))}
                  </Typography>
                </Box>
              )}

              {/* Details Button */}
              {onViewDetails && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => onViewDetails(food)}
                  sx={{ mt: 2 }}
                  color="success"
                >
                  View Details
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Card>
  );
}

FoodRankingPanel.propTypes = {
  foods: PropTypes.arrayOf(PropTypes.shape({
    compound: PropTypes.string.isRequired,
    targets: PropTypes.array,
    pathways: PropTypes.array,
    efficacy_score: PropTypes.number,
    confidence: PropTypes.number,
    sae_features: PropTypes.object,
    dosage: PropTypes.string,
    rationale: PropTypes.string,
    citations: PropTypes.array
  }))
};


