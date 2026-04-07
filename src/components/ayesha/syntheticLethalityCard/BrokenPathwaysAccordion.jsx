import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { pct, safeArray } from './slUtils';

export function BrokenPathwaysAccordion({ missingPayload, levelKey, broken }) {
  return (
    <Accordion defaultExpanded sx={{ mb: 1.5 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 900 }}>What’s broken (inputs → disruption)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {missingPayload ? (
          <Typography variant="body2" color="text.secondary">
            Missing: `levels.{levelKey}.synthetic_lethality` in bundle.
          </Typography>
        ) : broken.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No broken pathways reported.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {broken.map((p, idx) => {
              const pid = String(p?.pathway_id || '');
              const unmapped = pid === 'UNKNOWN';
              return (
                <Box
                  key={`${pid}-${idx}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: unmapped ? '#cbd5e1' : '#e2e8f0',
                    bgcolor: unmapped ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 900 }}>
                      {unmapped ? 'Unmapped/VUS pathway impact' : String(p?.pathway_name || pid || 'Pathway')}
                    </Typography>
                    <Chip size="small" label={String(p?.status || 'unknown')} variant="outlined" />
                    <Chip size="small" label={`disruption ${pct(p?.disruption_score)}`} variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Genes: {safeArray(p?.genes_affected).filter(Boolean).join(', ') || '—'}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
