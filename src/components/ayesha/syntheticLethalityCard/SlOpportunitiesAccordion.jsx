import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SlCheckpointOpportunityCard } from './SlCheckpointOpportunityCard';
import { SlParpOpportunityCard } from './SlParpOpportunityCard';
import { SlPi3kOpportunityCard } from './SlPi3kOpportunityCard';

export function SlOpportunitiesAccordion({
  missingPayload,
  opportunity,
  checkpointDrugs,
  depmapLines,
  parpRequires,
  parpDrugs,
  pi3kDrugs,
  levelKey,
  onShowTrials,
}) {
  return (
    <Accordion defaultExpanded sx={{ mb: 1.5 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 900 }}>Opportunities (UI-derived; computed from essential pathways)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          <SlCheckpointOpportunityCard
            missingPayload={missingPayload}
            hasCheckpointAxis={opportunity.checkpointAxis}
            checkpointDepMap={opportunity.checkpointDepMap}
            checkpointDrugs={checkpointDrugs}
            depmapLines={depmapLines}
            levelKey={levelKey}
            onShowTrials={onShowTrials}
          />
          <SlParpOpportunityCard
            missingPayload={missingPayload}
            hasParpAxis={opportunity.parpAxis}
            parpDepMap={opportunity.parpDepMap}
            parpRequires={parpRequires}
            parpDrugs={parpDrugs}
          />
          <SlPi3kOpportunityCard
            missingPayload={missingPayload}
            pi3kPathway={opportunity.pi3kPathway}
            pi3kDrugs={pi3kDrugs}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
