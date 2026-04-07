import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SL_ACCORDION_OUTLINED_SX } from './slUtils';

export function BiologicalRationaleAccordion({ doubleHitDescription, explanationSummary }) {
  if (!doubleHitDescription && !explanationSummary) return null;
  return (
    <Accordion defaultExpanded sx={{ ...SL_ACCORDION_OUTLINED_SX }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 900 }}>Biological Rationale</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
        {doubleHitDescription && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, border: '1px solid #fed7aa', bgcolor: '#fff7ed' }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#ea580c', display: 'block', mb: 0.5 }}>
              Double-Hit Vulnerability
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#9a3412' }}>
              {doubleHitDescription}
            </Typography>
          </Box>
        )}
        {explanationSummary && (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {explanationSummary}
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
