import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SL_ACCORDION_OUTLINED_SX, safeArray } from './slUtils';

const tierTone = {
  'Validated SL therapeutic lever': {
    bg: '#ecfdf5',
    border: '#6ee7b7',
    text: '#065f46',
  },
  'Strong candidate dependency axis': {
    bg: '#eff6ff',
    border: '#93c5fd',
    text: '#1d4ed8',
  },
  'Mechanistic candidate only': {
    bg: '#fffbeb',
    border: '#fcd34d',
    text: '#92400e',
  },
  'Not supported / negative': {
    bg: '#f8fafc',
    border: '#cbd5e1',
    text: '#475569',
  },
};

function getTierTone(tier) {
  return tierTone[tier] || tierTone['Not supported / negative'];
}

export function SlCanonicalRecommendations({
  recommendations,
  source,
  onShowTrials,
}) {
  const items = safeArray(recommendations);
  if (!items.length) return null;

  return (
    <Accordion defaultExpanded sx={{ ...SL_ACCORDION_OUTLINED_SX }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontWeight: 900 }}>
            Canonical recommendation spine ({items.length})
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Derived from the fused evidence matrix, not legacy bundle ordering.
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
        <Stack spacing={1.25}>
          {items.map((item, index) => {
            const tier = String(
              item?.recommendation_tier ||
                item?.tier ||
                item?.final_recommendation_tier ||
                'Not supported / negative'
            );
            const label = String(
              item?.axis_label || item?.label || item?.axis_key || `Axis ${index + 1}`
            );
            const interpretation = String(
              item?.display_interpretation || item?.interpretation || ''
            ).trim();
            const evidenceLevel = item?.overall_evidence_level || item?.overallEvidenceLevel;
            const modalities = safeArray(
              item?.positive_modalities || item?.positiveModalities
            );
            const tone = getTierTone(tier);

            return (
              <Box
                key={`${String(item?.axis_key || label)}-${index}`}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: tone.bg,
                  border: `1px solid ${tone.border}`,
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ mb: interpretation ? 1 : 0 }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: tone.text }}>
                      #{item?.ui_rank || index + 1} {label}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: 'wrap', mt: 0.75 }}>
                      <Chip size="small" label={tier} sx={{ fontWeight: 700, color: tone.text, borderColor: tone.border }} variant="outlined" />
                      {evidenceLevel ? (
                        <Chip size="small" label={`Evidence ${evidenceLevel}`} variant="outlined" />
                      ) : null}
                      {modalities.map((modality) => (
                        <Chip
                          key={String(modality)}
                          size="small"
                          label={`+ ${String(modality)}`}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                  {onShowTrials && item?.axis_key ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onShowTrials(item.axis_key)}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Show trials
                    </Button>
                  ) : null}
                </Stack>

                {interpretation ? (
                  <Typography variant="body2" sx={{ color: tone.text, lineHeight: 1.6 }}>
                    {interpretation}
                  </Typography>
                ) : null}

                {item?.mismatch_vs_legacy ? (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                    Legacy mismatch: {String(item.mismatch_vs_legacy)}
                  </Typography>
                ) : null}
              </Box>
            );
          })}
        </Stack>

        {source ? (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1.5 }}>
            Source: {String(source)}
          </Typography>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
}
