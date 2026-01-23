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
                    {/* Completeness Level Badge (L0/L1/L2) */}
                    {drug.sporadic_gates_provenance?.level && (
                      <Chip
                        label={`Intake: ${drug.sporadic_gates_provenance.level}`}
                        color={drug.sporadic_gates_provenance.level === 'L2' ? 'success' : 
                               drug.sporadic_gates_provenance.level === 'L1' ? 'warning' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    )}
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

              {/* PGx Screening (RUO) */}
              {drug.pgx_screening && drug.pgx_screening.screened && (
                <Box sx={{ mb: 2, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    PGx Safety (RUO)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip
                      label={`PGx Tier: ${drug.pgx_screening.toxicity_tier || 'UNKNOWN'}`}
                      size="small"
                      color={
                        (drug.pgx_screening.toxicity_tier || '').toUpperCase() === 'HIGH' ? 'error' :
                        (drug.pgx_screening.toxicity_tier || '').toUpperCase() === 'MODERATE' ? 'warning' :
                        'success'
                      }
                      variant="outlined"
                    />
                    {typeof drug.pgx_screening.adjustment_factor === 'number' && (
                      <Chip
                        label={`Adj: ${drug.pgx_screening.adjustment_factor.toFixed(2)}×`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {drug.pgx_screening.rationale && (
                   <Typography variant="body2" color="text.secondary">
                      {drug.pgx_screening.rationale}
                    </Typography>
                  )}
                  {Array.isArray(drug.pgx_screening.alerts) && drug.pgx_screening.alerts.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Alerts
                      </Typography>
                      {drug.pgx_screening.alerts.slice(0, 3).map((a, aidx) => (
                        <Typography key={aidx} variant="body2" sx={{ mt: 0.5 }}>
                          • <strong>{a.gene}</strong>: {a.message}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

            {/* Sporadic Gates Provenance - Why this confidence? */}
              {drug.sporadic_gates_provenance && !drug.sporadic_gates_provenance.error && (
                <Accordion sx={{ mb: 2, bgcolor: 'action.hover' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InfoIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Why this confidence?
                      </Typography>
                      {drug.sporadic_gates_provenance.gates_applied && drug.sporadic_gates_provenance.gates_applied.length > 0 && (
                        <Chip
                          label={`${drug.sporadic_gates_provenance.gates_applied.length} gate(s) applied`}
                          size="small"
                          color="info"
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Completeness Level */}
                      {drug.sporadic_gates_provenance.level && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Data Completeness
                          </Typography>
                          <Typography variant="body2">
                            <strong>{drug.sporadic_gates_provenance.level}</strong> - {
                              drug.sporadic_gates_provenance.level === 'L2' ? 'Full biomarker panel available' :
                              drug.sporadic_gates_provenance.level === 'L1' ? 'Partial biomarkers (TMB/MSI/HRD incomplete)' :
                              'Minimal data (disease priors only)'
                            }
                          </Typography>
                        </Box>
                      )}

                      {/* Gates Applied */}
                      {drug.sporadic_gates_provenance.gates_applied && drug.sporadic_gates_provenance.gates_applied.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Adjustments Applied
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                            {drug.sporadic_gates_provenance.gates_applied.map((gate, gidx) => (
                              <Chip
                                key={gidx}
                                label={gate.replace(/_/g, ' ')}
                                size="small"
                                color={gate.includes('PENALTY') ? 'error' : 
                                       gate.includes('RESCUE') ? 'success' : 
                                       gate.includes('BOOST') ? 'success' : 'default'}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Efficacy/Confidence Deltas */}
                      {(drug.sporadic_gates_provenance.efficacy_delta !== 0 || drug.sporadic_gates_provenance.confidence_delta !== 0) && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Score Adjustments
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            {drug.sporadic_gates_provenance.efficacy_delta !== 0 && (
                              <Typography variant="body2">
                                Efficacy: <strong style={{ color: drug.sporadic_gates_provenance.efficacy_delta < 0 ? 'red' : 'green' }}>
                                  {drug.sporadic_gates_provenance.efficacy_delta > 0 ? '+' : ''}
                                  {Math.round(drug.sporadic_gates_provenance.efficacy_delta * 100)}%
                                </strong>
                              </Typography>
                            )}
                            {drug.sporadic_gates_provenance.confidence_delta !== 0 && (
                              <Typography variant="body2">
                                Confidence: <strong style={{ color: drug.sporadic_gates_provenance.confidence_delta < 0 ? 'red' : 'green' }}>
                                  {drug.sporadic_gates_provenance.confidence_delta > 0 ? '+' : ''}
                                  {Math.round(drug.sporadic_gates_provenance.confidence_delta * 100)}%
                                </strong>
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Rationale */}
                      {drug.sporadic_gates_provenance.rationale && Array.isArray(drug.sporadic_gates_provenance.rationale) && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Explanation
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {drug.sporadic_gates_provenance.rationale.map((rationale, ridx) => (
                              <Typography key={ridx} variant="body2" sx={{ mb: 0.5 }}>
                                • <strong>{rationale.gate?.replace(/_/g, ' ')}</strong>: {rationale.reason || rationale.verdict}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Germline Status */}
                      {drug.sporadic_gates_provenance.germline_status && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Germline Status
                          </Typography>
                          <Typography variant="body2">
                          {drug.sporadic_gates_provenance.germline_status === 'positive' ? '✅ BRCA1/2 positive' :
                             drug.sporadic_gates_provenance.germline_status === 'negative' ? '⚠️ Germline negative' :
                             '❓ Unknown'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
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
                      {drug.sae_feine_fitness && (
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
    insights: PropTypes.object,
    sporadic_gates_provenance: PropTypes.object
  }))
};
