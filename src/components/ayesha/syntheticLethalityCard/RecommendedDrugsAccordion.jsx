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
import { pct, SL_ACCORDION_OUTLINED_SX } from './slUtils';

export function RecommendedDrugsAccordion({ missingPayload, recs, isSuperseded = false }) {
  if (missingPayload || !recs?.length) return null;
  return (
    <Accordion
      defaultExpanded={!isSuperseded}
      sx={{ ...SL_ACCORDION_OUTLINED_SX }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography sx={{ fontWeight: 900 }}>
            {isSuperseded ? 'Legacy recommended drugs' : 'Recommended drugs'} ({recs.length})
          </Typography>
          {isSuperseded ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Preserved for compatibility only; superseded by the canonical evidence-matrix recommendations.
            </Typography>
          ) : null}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
        <Stack spacing={1}>
          {recs.map((d, i) => (
            <Box
              key={`${String(d?.drug_name)}-${i}`}
              sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 900 }}>{String(d?.drug_name || 'Drug')}</Typography>
                <Chip size="small" label={`conf ${pct(d?.confidence)}`} variant="outlined" />
                <Chip size="small" label={String(d?.evidence_tier || '—')} variant="outlined" />
                <Chip size="small" label={String(d?.drug_class || '—')} variant="outlined" />
              </Stack>
              {d?.mechanism ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {String(d.mechanism).slice(0, 280)}
                  {String(d.mechanism).length > 280 ? '…' : ''}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
