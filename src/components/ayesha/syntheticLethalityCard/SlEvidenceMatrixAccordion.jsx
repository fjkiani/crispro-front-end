import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EvidenceMatrixTable } from '../../SyntheticLethality/components/EvidenceMatrixTable';

export function SlEvidenceMatrixAccordion({ evidenceMatrix }) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 900 }}>Multi-Modal Evidence Matrix</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          5-layer deterministic proof evaluating pharmacological vulnerability across established modalities.
        </Typography>
        {evidenceMatrix ? (
          <EvidenceMatrixTable matrix={evidenceMatrix} />
        ) : (
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1, border: '1px dashed #cbd5e1', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
              Evidence matrix is still evaluating or unavailable for this SL target.
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
