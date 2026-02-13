/**
 * SLEssentialPathways Component
 * 
 * Displays essential backup pathways in an accordion.
 */
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export const SLEssentialPathways = ({ 
  essentialPathways, 
  expanded, 
  onToggle 
}) => {
  if (!essentialPathways || essentialPathways.length === 0) {
    return null;
  }

  return (
    <Accordion
      expanded={expanded === 'essential'}
      onChange={() => onToggle(expanded === 'essential' ? null : 'essential')}
      sx={{ mb: 1 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">
          Essential Backup Pathways ({essentialPathways.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {essentialPathways.map((pathway, idx) => (
          <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {pathway.pathway_name}
            </Typography>
            {pathway.description && (
              <Typography variant="caption" color="text.secondary">
                {pathway.description}
              </Typography>
            )}
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};
