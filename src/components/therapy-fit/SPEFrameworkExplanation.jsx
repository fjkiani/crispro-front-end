/**
 * SPEFrameworkExplanation Component
 * 
 * Educational component explaining the S/P/E framework methodology,
 * including insights chips and their contribution to confidence scores.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ExpandMore,
  Science,
  Timeline,
  Article,
  Psychology,
} from '@mui/icons-material';

export default function SPEFrameworkExplanation() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        S/P/E Framework: How Drugs Are Ranked
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Our drug efficacy ranking uses a transparent, evidence-based methodology combining
        sequence analysis, pathway alignment, and literature evidence.
      </Typography>

      {/* Formula */}
      <Box sx={{ my: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Efficacy Score Formula:
        </Typography>
        <Typography variant="body1" component="code" sx={{ fontFamily: 'monospace' }}>
          efficacy_score = 0.3 × Sequence + 0.4 × Pathway + 0.3 × Evidence + ClinVar_prior
        </Typography>
      </Box>

      {/* Component Breakdown */}
      <Accordion expanded={expanded} onChange={(e, isExpanded) => setExpanded(isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Component Breakdown</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Science color="primary" />
                <Typography variant="subtitle2">Sequence (S) - 30%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Evo2 adaptive multi-window scoring (4096, 8192, 16384, 25000 bp windows).
                Measures variant disruption impact on protein function.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Timeline color="primary" />
                <Typography variant="subtitle2">Pathway (P) - 40%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Gene-to-pathway mapping with drug-pathway alignment. Scores how well
                a drug's mechanism of action matches the patient's disrupted pathways.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Article color="primary" />
                <Typography variant="subtitle2">Evidence (E) - 30%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Literature search (PubMed, OpenAlex, S2) and ClinVar classification.
                Aggregates clinical evidence supporting drug efficacy.
              </Typography>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Evidence Tiers */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Evidence Tiers:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip 
            label="Supported (≥0.6)" 
            color="success" 
            size="small"
            variant="outlined"
          />
          <Chip 
            label="Consider (≥0.3)" 
            color="warning" 
            size="small"
            variant="outlined"
          />
          <Chip 
            label="Insufficient (<0.3)" 
            color="default" 
            size="small"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Badges */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Evidence Badges:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Chip label="RCT" size="small" variant="outlined" />
          <Chip label="Guideline" size="small" variant="outlined" />
          <Chip label="ClinVar-Strong" size="small" variant="outlined" />
          <Chip label="PathwayAligned" size="small" variant="outlined" />
        </Stack>
      </Box>

      {/* Insights Chips Explanation */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Psychology color="primary" />
          <Typography variant="subtitle2">Insights Chips & Confidence Lifts</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          Four additional insights provide modest confidence lifts when thresholds are met:
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Insight</TableCell>
                <TableCell align="right">Threshold</TableCell>
                <TableCell align="right">Lift (Legacy)</TableCell>
                <TableCell align="right">Lift (V2)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><strong>Functionality</strong></TableCell>
                <TableCell align="right">≥0.6</TableCell>
                <TableCell align="right">+0.05</TableCell>
                <TableCell align="right">+0.04</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Chromatin</strong></TableCell>
                <TableCell align="right">≥0.5</TableCell>
                <TableCell align="right">+0.03</TableCell>
                <TableCell align="right">+0.02</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Essentiality</strong></TableCell>
                <TableCell align="right">≥0.7</TableCell>
                <TableCell align="right">+0.07</TableCell>
                <TableCell align="right">+0.02</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Regulatory</strong></TableCell>
                <TableCell align="right">≥0.6</TableCell>
                <TableCell align="right">+0.02</TableCell>
                <TableCell align="right">+0.02</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          <strong>V2 Mode:</strong> Total lifts capped at +0.08 (proportionally scaled if sum exceeds).
          Lifts are added directly to the base confidence score.
        </Typography>
      </Box>
    </Paper>
  );
}
