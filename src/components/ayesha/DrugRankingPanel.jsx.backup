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
import MedicationIcon from '@mui/icons-material/Medication';
import InfoIcon from '@mui/icons-material/Info';

/**
 * DrugRankingPanel - Displays ranked drug recommendations
 * 
 * Props:
 * @param {Array} drugs - Array of drug recommendation objects
 * @param {Function} onViewDetails - Optional callback when "Details" clicked
 */
export default function DrugRankingPanel({ drugs = [], onViewDetails }) {
  if (!drugs || drugs.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No drug recommendations available.
        </Typography>
      </Card>
    );
  }

  const getTierColor = (tier) => {
    if (tier === 'supported') return 'success';
    if (tier === 'consider') return 'warning';
    return 'default';
  };

  const getBadgeColor = (badge) => {
    if (badge === 'RCT' || badge === 'Guideline') return 'success';
    if (badge === 'ClinVar-Strong') return 'info';
    return 'default';
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <MedicationIcon color="primary" fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Drug Efficacy Rankings
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {drugs.map((drug, idx) => (
          <Card key={idx} variant="outlined" sx={{ bgcolor: idx === 0 ? 'primary.50' : 'white' }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {idx + 1}. {drug.drug}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Tier: ${drug.tier?.toUpperCase() || 'UNKNOWN'}`}
                      color={getTierColor(drug.tier)}
                      size="small"
                    />
                    {drug.badges && drug.badges.map((badge, bidx) => (
                      <Chip
                        key={bidx}
                        label={badge}
                        color={getBadgeColor(badge)}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {Math.round((drug.efficacy_score || 0) * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Confidence: {Math.round((drug.confidence || 0) * 100)}%
                  </Typography>
                </Box>
              </Box>

              {/* Score Bar */}
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(drug.efficacy_score || 0) * 100}
                  color="primary"
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>

              {/* Rationale */}
              {drug.rationale && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {drug.rationale}
                </Typography>
              )}

              {/* SAE Features */}
              {drug.sae_features && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Treatment Line Intelligence
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {drug.sae_features.line_fitness && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Line Fitness
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {Math.round(drug.sae_features.line_fitness.score * 100)}%
                          </Typography>
                        </Box>
                      )}
                      {drug.sae_features.cross_resistance && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Cross-Resistance Risk
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {drug.sae_features.cross_resistance.risk}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Citations */}
              {drug.citations && drug.citations.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Citations: {drug.citations.slice(0, 3).map(pmid => (
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
                  onClick={() => onViewDetails(drug)}
                  sx={{ mt: 2 }}
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

DrugRankingPanel.propTypes = {
  drugs: PropTypes.arrayOf(PropTypes.shape({
    drug: PropTypes.string.isRequired,
    efficacy_score: PropTypes.number,
    confidence: PropTypes.number,
    tier: PropTypes.string,
    sae_features: PropTypes.object,
    rationale: PropTypes.string,
    citations: PropTypes.array,
    badges: PropTypes.array,
    insights: PropTypes.object
  }))
};


