/**
 * ⚔️ ACMG CLASSIFICATION CARD ⚔️
 * 
 * Displays ACMG/AMP variant classification results:
 * - Classification (Pathogenic, Likely Pathogenic, VUS, etc.)
 * - Confidence score
 * - Evidence codes (PVS1, PS1, PM2, PP3, etc.)
 * - Rationale with Evo2 scoring
 * - Provenance and method tracking
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Alert
} from '@mui/material';
import { ExpandMore, CheckCircle, Warning, HelpOutline } from '@mui/icons-material';

const getClassificationColor = (classification) => {
  if (!classification) return 'default';
  const lower = classification.toLowerCase();
  if (lower.includes('pathogenic') && !lower.includes('likely')) return 'error';
  if (lower.includes('likely pathogenic')) return 'warning';
  if (lower.includes('vus') || lower.includes('uncertain')) return 'info';
  if (lower.includes('benign') && !lower.includes('likely')) return 'success';
  if (lower.includes('likely benign')) return 'success';
  return 'default';
};

const getClassificationIcon = (classification) => {
  const lower = classification?.toLowerCase() || '';
  if (lower.includes('pathogenic')) return <Warning />;
  if (lower.includes('benign')) return <CheckCircle />;
  return <HelpOutline />;
};

export const ACMGCard = ({ result, loading, error }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>🧬 ACMG Classification</Typography>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Analyzing variant pathogenicity...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>🧬 ACMG Classification</Typography>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!result) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>🧬 ACMG Classification</Typography>
        <Typography variant="body2" color="text.secondary">
          Enter a variant and click "Analyze" to see ACMG classification
        </Typography>
      </Paper>
    );
  }

  const classificationColor = getClassificationColor(result.classification);
  const classificationIcon = getClassificationIcon(result.classification);
  const confidence = result.confidence || 0;

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">🧬 ACMG Classification</Typography>
        <Chip
          label={`Confidence: ${(confidence * 100).toFixed(0)}%`}
          color={confidence > 0.7 ? 'success' : confidence > 0.5 ? 'warning' : 'default'}
          size="small"
        />
      </Box>

      {/* Classification Result */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Chip
          icon={classificationIcon}
          label={result.classification}
          color={classificationColor}
          sx={{ fontSize: '1.1rem', py: 3, px: 2 }}
        />
      </Box>

      {/* Evidence Codes */}
      {result.evidence_codes && result.evidence_codes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Evidence Codes:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {result.evidence_codes.map((code, idx) => (
              <Chip
                key={idx}
                label={`${code.code} (${code.strength})`}
                size="small"
                color={code.category === 'pathogenic' ? 'error' : 'success'}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Rationale */}
      {result.rationale && result.rationale.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Rationale ({result.rationale.length} points)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {result.rationale.map((item, idx) => (
                <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                  {item}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Provenance */}
      {result.provenance && (
        <Accordion sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Provenance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Method:</strong></TableCell>
                  <TableCell>{result.provenance.method || 'acmg_v1'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Timestamp:</strong></TableCell>
                  <TableCell>{result.provenance.timestamp || 'N/A'}</TableCell>
                </TableRow>
                {result.provenance.evo2_delta_score !== undefined && (
                  <TableRow>
                    <TableCell><strong>Evo2 Delta:</strong></TableCell>
                    <TableCell>{result.provenance.evo2_delta_score.toFixed(2)}</TableCell>
                  </TableRow>
                )}
                {result.provenance.clinvar_classification && (
                  <TableRow>
                    <TableCell><strong>ClinVar:</strong></TableCell>
                    <TableCell>{result.provenance.clinvar_classification}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Research Use Disclaimer */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="caption">
          ACMG classification is for research use only. Clinical interpretation requires manual review by certified genetic counselors.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default ACMGCard;


