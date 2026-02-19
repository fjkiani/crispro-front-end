/**
 * SLEssentialityScores Component
 * 
 * Displays gene essentiality scores in an accordion.
 */
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export const SLEssentialityScores = ({ 
  essentialityScores, 
  expanded, 
  onToggle 
}) => {
  if (!essentialityScores || essentialityScores.length === 0) {
    return null;
  }

  return (
    <Accordion
      expanded={expanded === 'essentiality'}
      onChange={() => onToggle(expanded === 'essentiality' ? null : 'essentiality')}
      sx={{ mb: 1 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">
          Gene Essentiality Scores ({essentialityScores.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {essentialityScores.map((score, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {score.gene}
                    </Typography>
                    <Chip
                      label={score.essentiality_level}
                      size="small"
                      color={
                        score.essentiality_score >= 0.7 
                          ? 'error' 
                          : score.essentiality_score >= 0.5 
                          ? 'warning' 
                          : 'default'
                      }
                    />
                    <LinearProgress
                      variant="determinate"
                      value={score.essentiality_score * 100}
                      sx={{ width: 100, height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption">
                      {(score.essentiality_score * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    {score.pathway_impact && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {score.pathway_impact}
                      </Typography>
                    )}
                    {score.functional_consequence && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {score.functional_consequence}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
