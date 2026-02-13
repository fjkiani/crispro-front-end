/**
 * SLBrokenPathways Component
 * 
 * Displays broken pathways in an accordion.
 */
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export const SLBrokenPathways = ({ 
  brokenPathways, 
  expanded, 
  onToggle 
}) => {
  if (!brokenPathways || brokenPathways.length === 0) {
    return null;
  }

  return (
    <Accordion
      expanded={expanded === 'broken'}
      onChange={() => onToggle(expanded === 'broken' ? null : 'broken')}
      sx={{ mb: 1 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">
          Broken Pathways ({brokenPathways.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {brokenPathways.map((pathway, idx) => (
          <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {pathway.pathway_name} ({pathway.status})
            </Typography>
            {pathway.description && (
              <Typography variant="caption" color="text.secondary">
                {pathway.description}
              </Typography>
            )}
            {pathway.genes_affected && pathway.genes_affected.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption">Affected genes: </Typography>
                {pathway.genes_affected.map((gene, gIdx) => (
                  <Chip key={gIdx} label={gene} size="small" sx={{ mr: 0.5 }} />
                ))}
              </Box>
            )}
          </Alert>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};
