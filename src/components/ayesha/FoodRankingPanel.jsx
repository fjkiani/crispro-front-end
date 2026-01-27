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
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';

/**
 * FoodRankingPanel - Displays ranked food/supplement recommendations
 * 
 * Props:
 * @param {Array} foods - Array of food recommendation objects
 * @param {Function} onViewDetails - Optional callback when "Details" clicked
 * @param {String} cancerType - Cancer type (e.g., "ovarian_cancer_hgs", "breast_cancer")
 * @param {String} treatmentLine - Treatment line (e.g., "L1", "L2", "L3")
 * @param {Object} biomarkers - Biomarker object (e.g., {HRD: "POSITIVE", TMB: 8})
 */
export default function FoodRankingPanel({ 
  foods = [], 
  onViewDetails,
  cancerType = null,
  treatmentLine = null,
  biomarkers = {}
}) {
  if (!foods || foods.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No food/supplement recommendations available.
        </Typography>
      </Card>
    );
  }

  // Format cancer type for display
  const formatCancerType = (type) => {
    if (!type) return null;
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Hgs', 'HGS')
      .replace('Cancer', 'Cancer');
  };

  // Format treatment line for display
  const formatTreatmentLine = (line) => {
    if (!line) return null;
    const lineMap = {
      'L1': 'First-Line',
      'L2': 'Second-Line',
      'L3': 'Third-Line'
    };
    return lineMap[line] || line;
  };

  // Get biomarker match indicators
  const getBiomarkerMatches = (food) => {
    const matches = [];
    if (biomarkers.HRD === 'POSITIVE' && food.pathways?.some(p => 
      p.toLowerCase().includes('dna repair') || 
      p.toLowerCase().includes('hrd') || 
      p.toLowerCase().includes('ddr')
    )) {
      matches.push('HRD+ match');
    }
    if (biomarkers.TMB >= 10 && food.pathways?.some(p => 
      p.toLowerCase().includes('immune') || 
      p.toLowerCase().includes('checkpoint')
    )) {
      matches.push('TMB-high match');
    }
    if (biomarkers.MSI === 'HIGH' && food.pathways?.some(p => 
      p.toLowerCase().includes('mismatch') || 
      p.toLowerCase().includes('dna repair')
    )) {
      matches.push('MSI-high match');
    }
    return matches;
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <RestaurantIcon color="primary" fontSize="large" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Food/Supplement Support
          </Typography>
          {/* Treatment Line and Cancer Type Context */}
          {(cancerType || treatmentLine) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Recommended for: {treatmentLine ? `${formatTreatmentLine(treatmentLine)} chemotherapy` : ''}
              {treatmentLine && cancerType ? ', ' : ''}
              {cancerType ? formatCancerType(cancerType) : ''}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Disclaimer */}
      <Box
        sx={{
          bgcolor: 'warning.light',
          border: '1px solid',
          borderColor: 'warning.main',
          borderRadius: 1,
          p: 2,
          mb: 3,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start'
        }}
      >
        <WarningIcon sx={{ color: 'warning.dark', mt: 0.5 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Research Use Only - Not Medical Advice
          </Typography>
          <Typography variant="body2" color="text.secondary">
            These recommendations are <strong>mechanism-aligned and treatment-aware</strong>, 
            meaning they assess how food compounds align with cancer pathways and treatment contexts. 
            They do <strong>not predict clinical outcomes</strong> or replace professional medical advice. 
            Always consult with your oncologist before making dietary changes during cancer treatment.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {foods.map((food, idx) => (
          <Card key={idx} variant="outlined" sx={{ bgcolor: idx === 0 ? 'success.50' : 'white' }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {idx + 1}. {food.compound}
                  </Typography>
                  {/* Toxicity Mitigation Badge - THE MOAT */}
                  {food.toxicity_mitigation?.mitigates && (
                    <Chip
                      icon={<SecurityIcon />}
                      label={`Mitigates ${food.toxicity_mitigation.target_drug} ${food.toxicity_mitigation.pathway} stress`}
                      color="success"
                      size="small"
                      sx={{ mb: 1, mt: 0.5 }}
                    />
                  )}
                  {/* Biomarker Match Indicators */}
                  {Object.keys(biomarkers).length > 0 && getBiomarkerMatches(food).length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {getBiomarkerMatches(food).map((match, midx) => (
                        <Chip
                          key={midx}
                          label={match}
                          size="small"
                          color="info"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      ))}
                    </Box>
                  )}
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
                    {Math.round((food.alignment_score || food.efficacy_score || 0) * 100)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Alignment Score
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Confidence: {Math.round((food.confidence || 0) * 100)}%
                  </Typography>
                </Box>
              </Box>

              {/* Alignment Score Bar */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Mechanism Alignment
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(food.alignment_score || food.efficacy_score || 0) * 100}
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
    citations: PropTypes.array,
    toxicity_mitigation: PropTypes.shape({
      mitigates: PropTypes.bool,
      target_drug: PropTypes.string,
      target_moa: PropTypes.string,
      pathway: PropTypes.string,
      mechanism: PropTypes.string,
      timing: PropTypes.string,
      evidence_tier: PropTypes.string,
      dose: PropTypes.string
    })
  })),
  onViewDetails: PropTypes.func,
  cancerType: PropTypes.string,
  treatmentLine: PropTypes.string,
  biomarkers: PropTypes.object
};


