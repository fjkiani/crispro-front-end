/**
 * DrugRankingCard Component
 * 
 * Displays drug efficacy rankings from S/P/E framework.
 * Modular, self-contained component.
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import {
  LocalPharmacy,
  ExpandMore,
  OpenInNew,
  CheckCircle,
  Warning,
  Cancel,
} from '@mui/icons-material';

export const DrugRankingCard = ({ drugRanking, mechanismVector, loading = false }) => {
  const [expandedDrug, setExpandedDrug] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Loading drug rankings...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!drugRanking || !drugRanking.ranked_drugs || drugRanking.ranked_drugs.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No drug rankings available</Typography>
        </CardContent>
      </Card>
    );
  }

  const drugs = drugRanking.ranked_drugs || [];
  const evidenceTier = drugRanking.evidence_tier || 'insufficient';

  const getTierColor = (tier) => {
    if (tier === 'supported') return 'success';
    if (tier === 'consider') return 'warning';
    return 'default';
  };

  const getTierIcon = (tier) => {
    if (tier === 'supported') return <CheckCircle color="success" />;
    if (tier === 'consider') return <Warning color="warning" />;
    return <Cancel color="disabled" />;
  };

  return (
    <Card>
      <CardHeader
        avatar={<LocalPharmacy />}
        title="Drug Efficacy Rankings"
        subheader={`S/P/E Framework - ${drugs.length} drugs ranked`}
      />
      <CardContent>
        {/* Evidence Tier Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Overall Evidence Tier
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            {getTierIcon(evidenceTier)}
            <Chip
              label={evidenceTier.toUpperCase()}
              color={getTierColor(evidenceTier)}
              size="small"
            />
          </Box>
        </Box>

        {/* Top Drugs Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Drug</TableCell>
                <TableCell>MoA</TableCell>
                <TableCell align="right">Efficacy</TableCell>
                <TableCell align="right">Confidence</TableCell>
                <TableCell>Tier</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drugs.slice(0, 10).map((drug, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{idx + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {drug.drug_name || drug.name || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {drug.moa || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(drug.efficacy_score || 0) * 100}
                        sx={{ width: 60, height: 8, borderRadius: 1 }}
                        color={drug.efficacy_score > 0.5 ? 'success' : drug.efficacy_score > 0.3 ? 'warning' : 'error'}
                      />
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {(drug.efficacy_score || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {(drug.confidence || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={drug.evidence_tier || 'insufficient'}
                      size="small"
                      color={getTierColor(drug.evidence_tier)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Drug Details Accordion */}
        {drugs.slice(0, 5).map((drug, idx) => (
          <Accordion
            key={idx}
            expanded={expandedDrug === idx}
            onChange={() => setExpandedDrug(expandedDrug === idx ? null : idx)}
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">
                  {drug.drug_name || drug.name}
                </Typography>
                {drug.badges && drug.badges.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                    {drug.badges.map((badge, badgeIdx) => (
                      <Chip key={badgeIdx} label={badge} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Rationale */}
              {drug.rationale && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Rationale
                  </Typography>
                  {Array.isArray(drug.rationale) ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {drug.rationale.map((item, rIdx) => (
                        <li key={rIdx}>
                          <Typography variant="body2" color="text.secondary">
                            {typeof item === 'string' ? item : item.text || JSON.stringify(item)}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {drug.rationale}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Citations */}
              {drug.citations && drug.citations.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Citations ({drug.citations.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {drug.citations.slice(0, 5).map((citation, cIdx) => (
                      <Chip
                        key={cIdx}
                        label={citation}
                        size="small"
                        variant="outlined"
                        icon={<OpenInNew />}
                        onClick={() => {
                          if (citation.includes('PMID')) {
                            const pmid = citation.match(/PMID[:\s]*(\d+)/)?.[1];
                            if (pmid) {
                              window.open(`https://pubmed.ncbi.nlm.nih.gov/${pmid}`, '_blank');
                            }
                          }
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Insights */}
              {drug.insights && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Insights
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(drug.insights).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${(value * 100).toFixed(0)}%`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Mechanism Vector */}
        {mechanismVector && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Mechanism Vector
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
              {['DDR', 'MAPK', 'PI3K', 'VEGF', 'HER2', 'IO', 'Efflux'].map((pathway, idx) => (
                <Chip
                  key={idx}
                  label={`${pathway}: ${(mechanismVector[idx] || 0).toFixed(2)}`}
                  size="small"
                  variant="outlined"
                  color={mechanismVector[idx] > 0.5 ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

