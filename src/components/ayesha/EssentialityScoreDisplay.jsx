/**
 * EssentialityScoreDisplay Component
 * 
 * Displays gene essentiality scores in a patient-friendly format.
 * Shows which genes are critical for tumor survival and why.
 * 
 * Props:
 * - essentialityScores: Array of { gene, essentiality_score, essentiality_level, pathway_impact?, functional_consequence? }
 * - title: Optional custom title (default: "Gene Essentiality Scores")
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Science as ScienceIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

export default function EssentialityScoreDisplay({ essentialityScores = [], title = "Gene Essentiality Scores" }) {
  if (!essentialityScores || essentialityScores.length === 0) {
    return null;
  }

  const getEssentialityColor = (score) => {
    if (score >= 0.7) return 'error';
    if (score >= 0.5) return 'warning';
    return 'default';
  };

  const getEssentialityLabel = (score) => {
    if (score >= 0.7) return 'HIGH';
    if (score >= 0.5) return 'MODERATE';
    return 'LOW';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ScienceIcon />
          <Typography variant="h6">{title}</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Essentiality scores measure how critical a gene is for tumor survival. Higher scores mean 
          the gene loss creates a vulnerability that can be targeted with drugs.
        </Typography>

        <List>
          {essentialityScores.map((score, idx) => (
            <ListItem
              key={idx}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: score.essentiality_score >= 0.7 ? 'error.light' : 'background.paper',
                opacity: score.essentiality_score >= 0.7 ? 0.9 : 1
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body1" fontWeight="bold">
                      {score.gene}
                    </Typography>
                    <Chip
                      label={score.essentiality_level || getEssentialityLabel(score.essentiality_score)}
                      color={getEssentialityColor(score.essentiality_score)}
                      size="small"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={score.essentiality_score * 100}
                        sx={{ flexGrow: 1, maxWidth: 200, height: 8, borderRadius: 1 }}
                        color={getEssentialityColor(score.essentiality_score)}
                      />
                      <Typography variant="body2" fontWeight="medium" sx={{ minWidth: 50 }}>
                        {(score.essentiality_score * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {score.pathway_impact && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Pathway Impact:</strong> {score.pathway_impact}
                      </Typography>
                    )}
                    {score.functional_consequence && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Functional Consequence:</strong> {score.functional_consequence}
                      </Typography>
                    )}
                    {score.sequence_disruption && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Sequence Disruption:</strong> {score.sequence_disruption}
                      </Typography>
                    )}
                    {score.confidence && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        <strong>Confidence:</strong> {(score.confidence * 100).toFixed(0)}%
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              What does essentiality mean?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Essentiality scores measure how much a gene loss affects tumor survival. When essentiality 
              is high (≥70%), the tumor heavily depends on that gene or its backup pathways.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Why this matters:</strong> If a gene has high essentiality and is broken by a mutation, 
              drugs that target the backup pathways can be highly effective (synthetic lethality).
            </Typography>
            <Typography variant="body2">
              For example, MBD4 has an essentiality score of 0.80, meaning its loss creates a vulnerability 
              that can be exploited with PARP inhibitors or platinum chemotherapy.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}
