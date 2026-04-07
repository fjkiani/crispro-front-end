import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function NextTestsAccordion() {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 900 }}>What tests to order next (highest yield)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Rendered as coordination prompts (RUO). These align to the gating and receipts shown above.
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Confirm MBD4 is truly inactivated in the tumor</strong> — Tumor NGS should clarify this with copy number + VAF context (second hit / LOH).
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Zygosity / LOH / second hit</strong> — biallelic loss matters a lot for repair genes; consider matched normal if feasible.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>HRD testing</strong> — if HRD is high, PARP sensitivity becomes more defensible (and not just “BER → PARP” logic).
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Genomic instability / mutational-signature support</strong> — look for signatures consistent with DNA repair defects (plus overall TMB context).
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Functional evidence (research setting)</strong> — RAD51 foci / replication stress markers (γ‑H2AX), or ex vivo sensitivity assays.
            </Typography>
          </li>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
