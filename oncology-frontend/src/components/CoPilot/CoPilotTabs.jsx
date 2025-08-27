import React from 'react';
import { Box, Button } from '@mui/material';
import { QuestionAnswer as QuestionIcon, Lightbulb as InsightIcon, Help as HelpIcon } from '@mui/icons-material';

/**
 * CoPilot Tabs Component
 * Navigation tabs for different CoPilot views
 */
export const CoPilotTabs = ({ currentTab, onTabChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', px: 2 }}>
        <Button
          onClick={() => onTabChange('chat')}
          sx={{
            borderRadius: 0,
            borderBottom: currentTab === 'chat' ? 2 : 0,
            borderColor: 'primary.main',
            flex: 1
          }}
        >
          <QuestionIcon sx={{ mr: 1 }} />
          Chat
        </Button>
        <Button
          onClick={() => onTabChange('insights')}
          sx={{
            borderRadius: 0,
            borderBottom: currentTab === 'insights' ? 2 : 0,
            borderColor: 'primary.main',
            flex: 1
          }}
        >
          <InsightIcon sx={{ mr: 1 }} />
          Insights
        </Button>
        <Button
          onClick={() => onTabChange('help')}
          sx={{
            borderRadius: 0,
            borderBottom: currentTab === 'help' ? 2 : 0,
            borderColor: 'primary.main',
            flex: 1
          }}
        >
          <HelpIcon sx={{ mr: 1 }} />
          Help
        </Button>
      </Box>
    </Box>
  );
};

