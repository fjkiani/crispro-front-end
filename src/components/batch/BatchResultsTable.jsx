import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Link
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import PercentileBar from '../food/PercentileBar';
import EvidenceQualityChips from '../food/EvidenceQualityChips';
import MechanismPanel from '../food/MechanismPanel';

/**
 * BatchResultsTable Component
 * 
 * Displays batch validation results in a sortable, filterable table.
 * Supports:
 * - Sorting by score, confidence, evidence grade
 * - Expandable row details
 * - Quick view of key metrics
 */
export default function BatchResultsTable({ results }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortBy, setSortBy] = useState('overall_score');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const toggleRowExpansion = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'overall_score':
        aVal = a.overall_score || 0;
        bVal = b.overall_score || 0;
        break;
      case 'confidence':
        aVal = a.confidence || 0;
        bVal = b.confidence || 0;
        break;
      case 'evidence_grade':
        const gradeOrder = { 'STRONG': 4, 'MODERATE': 3, 'WEAK': 2, 'INSUFFICIENT': 1 };
        aVal = gradeOrder[a.evidence?.evidence_grade] || 0;
        bVal = gradeOrder[b.evidence?.evidence_grade] || 0;
        break;
      case 'compound':
        aVal = a.compound || '';
        bVal = b.compound || '';
        break;
      default:
        return 0;
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getVerdictColor = (verdict) => {
    if (verdict === 'SUPPORTED') return 'success';
    if (verdict === 'WEAK_SUPPORT') return 'warning';
    return 'error';
  };

  if (results.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No results to display
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>
              <TableSortLabel
                active={sortBy === 'compound'}
                direction={sortBy === 'compound' ? sortOrder : 'asc'}
                onClick={() => handleSort('compound')}
              >
                Compound
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'overall_score'}
                direction={sortBy === 'overall_score' ? sortOrder : 'desc'}
                onClick={() => handleSort('overall_score')}
              >
                Overall Score
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'confidence'}
                direction={sortBy === 'confidence' ? sortOrder : 'desc'}
                onClick={() => handleSort('confidence')}
              >
                Confidence
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'evidence_grade'}
                direction={sortBy === 'evidence_grade' ? sortOrder : 'desc'}
                onClick={() => handleSort('evidence_grade')}
              >
                Evidence Grade
              </TableSortLabel>
            </TableCell>
            <TableCell>Verdict</TableCell>
            <TableCell>Mechanisms</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedResults.map((result, index) => {
            const isExpanded = expandedRows.has(index);
            const hasDetails = result.spe_percentile !== null || 
                             result.evidence?.papers?.length > 0 ||
                             (result.targets && result.targets.length > 0);

            return (
              <React.Fragment key={index}>
                <TableRow hover>
                  <TableCell>
                    {hasDetails && (
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(index)}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {result.compound}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {(result.overall_score * 100).toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {(result.confidence * 100).toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={result.evidence?.evidence_grade || 'N/A'}
                      size="small"
                      color={
                        result.evidence?.evidence_grade === 'STRONG' ? 'success' :
                        result.evidence?.evidence_grade === 'MODERATE' ? 'info' :
                        result.evidence?.evidence_grade === 'WEAK' ? 'warning' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={result.verdict || 'N/A'}
                      size="small"
                      color={getVerdictColor(result.verdict)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {result.mechanisms?.slice(0, 3).map((mech, i) => (
                        <Chip
                          key={i}
                          label={mech}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {result.mechanisms?.length > 3 && (
                        <Tooltip title={result.mechanisms.slice(3).join(', ')}>
                          <Chip
                            label={`+${result.mechanisms.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                {isExpanded && hasDetails && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ bgcolor: 'background.default', p: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Percentile Bar */}
                        {result.spe_percentile !== null && result.spe_percentile !== undefined && (
                          <PercentileBar
                            spePercentile={result.spe_percentile}
                            interpretation={result.interpretation}
                            rawScore={result.overall_score}
                            showRawScore={true}
                          />
                        )}

                        {/* Evidence Quality */}
                        {result.evidence && result.evidence.papers && result.evidence.papers.length > 0 && (
                          <EvidenceQualityChips
                            papers={result.evidence.papers}
                            evidenceGrade={result.evidence.evidence_grade}
                            totalPapers={result.evidence.total_papers || result.evidence.papers.length}
                            rctCount={result.evidence.rct_count || 0}
                          />
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
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              S/P/E Breakdown:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Typography variant="body2">
                                <strong>S:</strong> {(result.spe_breakdown.sequence * 100).toFixed(0)}%
                              </Typography>
                              <Typography variant="body2">
                                <strong>P:</strong> {(result.spe_breakdown.pathway * 100).toFixed(0)}%
                              </Typography>
                              <Typography variant="body2">
                                <strong>E:</strong> {(result.spe_breakdown.evidence * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

