import React from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { SmartToy as AIIcon, Help as QuestionIcon } from '@mui/icons-material';
import { useCoPilot } from '../context/CoPilotContext';
import { useCoPilotIntegration } from '../hooks/useCoPilotIntegration';

/**
 * Quick action buttons for embedding in existing components
 */
export const CoPilotQuickActions = ({ variant, compact = false }) => {
  const { setIsOpen } = useCoPilot();
  const { askAboutVariant, askAboutTreatment } = useCoPilotIntegration({ variant });

  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Tooltip title="Ask Co-Pilot about this variant">
          <IconButton
            size="small"
            onClick={() => setIsOpen(true)}
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            <AIIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Functional impact">
          <IconButton
            size="small"
            onClick={() => {
              const question = askAboutVariant(variant);
              setIsOpen(true);
            }}
            sx={{ bgcolor: 'info.main', color: 'white' }}
          >
            <QuestionIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Button
        size="small"
        variant="contained"
        startIcon={<AIIcon />}
        onClick={() => setIsOpen(true)}
      >
        Ask Co-Pilot
      </Button>

      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          const question = askAboutVariant(variant);
          setIsOpen(true);
        }}
      >
        Functional Impact
      </Button>
    </Box>
  );
};
