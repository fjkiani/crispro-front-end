import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Stack,
  Fade,
  Paper,
  IconButton,
  Tooltip,
  alpha,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import PercentileBar from '../food/PercentileBar';
import EvidenceQualityChips from '../food/EvidenceQualityChips';
import MechanismPanel from '../food/MechanismPanel';

/**
 * HolisticResultsDisplay Component
 * 
 * Beautiful, card-based results display with:
 * - Gradient cards for each result
 * - Expandable details
 * - Visual hierarchy
 * - Smooth animations
 */
export default function HolisticResultsDisplay({ results }) {
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCard = (index) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'info';
    if (score >= 0.3) return 'warning';
    return 'error';
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'SUPPORTED') return 'success';
    if (verdict === 'WEAK_SUPPORT') return 'warning';
    return 'error';
  };

  if (results.length === 0) {
    return null;
  }

  // Sort by overall score (highest first)
  const sortedResults = [...results].sort((a, b) => 
    (b.overall_score || 0) - (a.overall_score || 0)
  );

  return (
    <Grid container spacing={3}>
      {sortedResults.map((result, index) => {
        const isExpanded = expandedCards.has(index);
        const scoreColor = getScoreColor(result.overall_score || 0);
        const verdictColor = getVerdictColor(result.verdict);

        return (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Fade in timeout={300 + index * 100}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  },
                  background: isExpanded
                    ? 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)'
                    : 'white',
                  border: `2px solid ${alpha('#667eea', isExpanded ? 0.3 : 0.1)}`
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha('#667eea', 0.1)} 0%, ${alpha('#764ba2', 0.1)} 100%)`,
                    borderBottom: `1px solid ${alpha('#667eea', 0.2)}`
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {result.compound}
                      </Typography>
                      <Chip
                        label={result.verdict || 'N/A'}
                        size="small"
                        color={verdictColor}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => toggleCard(index)}
                      sx={{
                        bgcolor: alpha('#667eea', 0.1),
                        '&:hover': { bgcolor: alpha('#667eea', 0.2) }
                      }}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Stack>

                  {/* Score Display */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center'
                    }}
                  >
                    <Paper
                      sx={{
                        flex: 1,
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(`#${scoreColor === 'success' ? '4caf50' : scoreColor === 'info' ? '2196f3' : scoreColor === 'warning' ? 'ff9800' : 'f44336'}`, 0.1)} 0%, ${alpha(`#${scoreColor === 'success' ? '4caf50' : scoreColor === 'info' ? '2196f3' : scoreColor === 'warning' ? 'ff9800' : 'f44336'}`, 0.05)} 100%)`,
                        border: `1px solid ${alpha(`#${scoreColor === 'success' ? '4caf50' : scoreColor === 'info' ? '2196f3' : scoreColor === 'warning' ? 'ff9800' : 'f44336'}`, 0.2)}`
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Overall Score
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: `${scoreColor}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5
                        }}
                      >
                        <TrendingUpIcon fontSize="small" />
                        {(result.overall_score * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        flex: 1,
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                        background: alpha('#2196f3', 0.05),
                        border: `1px solid ${alpha('#2196f3', 0.2)}`
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Confidence
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: 'info.main'
                        }}
                      >
                        {(result.confidence * 100).toFixed(0)}%
                      </Typography>
                    </Paper>
                  </Box>
                </Box>

                {/* Quick Stats */}
                <Box sx={{ p: 2, borderBottom: `1px solid ${alpha('#667eea', 0.1)}` }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {result.evidence?.evidence_grade && (
                      <Chip
                        label={`${result.evidence.evidence_grade} Evidence`}
                        size="small"
                        color={
                          result.evidence.evidence_grade === 'STRONG' ? 'success' :
                          result.evidence.evidence_grade === 'MODERATE' ? 'info' :
                          result.evidence.evidence_grade === 'WEAK' ? 'warning' : 'default'
                        }
                      />
                    )}
                    {result.mechanisms && result.mechanisms.length > 0 && (
                      <Chip
                        label={`${result.mechanisms.length} Mechanism(s)`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {result.targets && result.targets.length > 0 && (
                      <Chip
                        label={`${result.targets.length} Target(s)`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>

                {/* Expanded Details */}
                <Collapse in={isExpanded}>
                  <Box sx={{ p: 3 }}>
                    {/* Percentile Bar */}
                    {result.spe_percentile !== null && result.spe_percentile !== undefined && (
                      <Box sx={{ mb: 3 }}>
                        <PercentileBar
                          spePercentile={result.spe_percentile}
                          interpretation={result.interpretation}
                          rawScore={result.overall_score}
                          showRawScore={true}
                        />
                      </Box>
                    )}

                    {/* Evidence Quality */}
                    {result.evidence && result.evidence.papers && result.evidence.papers.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <EvidenceQualityChips
                          papers={result.evidence.papers}
                          evidenceGrade={result.evidence.evidence_grade}
                          totalPapers={result.evidence.total_papers || result.evidence.papers.length}
                          rctCount={result.evidence.rct_count || 0}
                        />
                      </Box>
                    )}

                    {/* Mechanism Panel */}
                    {(result.targets || result.pathways || result.mechanisms) && (
                      <MechanismPanel
                        targets={result.targets || []}
                        pathways={result.pathways || []}
                        mechanisms={result.mechanisms || []}
                        mechanismScores={result.mechanism_scores || {}}
                        tcgaWeights={result.provenance?.tcga_weights?.pathway_weights || {}}
                        disease={result.provenance?.disease_name || result.provenance?.disease || ''}
                      />
                    )}

                    {/* S/P/E Breakdown */}
                    {result.spe_breakdown && (
                      <Paper sx={{ p: 2, bgcolor: alpha('#667eea', 0.05), borderRadius: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          S/P/E Breakdown:
                        </Typography>
                        <Stack direction="row" spacing={3}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Sequence (S)</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {(result.spe_breakdown.sequence * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Pathway (P)</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {(result.spe_breakdown.pathway * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Evidence (E)</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {(result.spe_breakdown.evidence * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    )}
                  </Box>
                </Collapse>
              </Card>
            </Fade>
          </Grid>
        );
      })}
    </Grid>
  );
}

