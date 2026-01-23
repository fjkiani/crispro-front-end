import React from 'react';
import { Box, Drawer, Fade, Fab, Badge, Tooltip } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { useCoPilot } from './context/CoPilotContext';
import { useCoPilotLogic } from './CoPilotLogic';
import { CoPilotDrawer } from './CoPilotDrawer';
import { ChatInterface } from './ChatInterface';
import { InsightsPanel } from './InsightsPanel';
import { HelpPanel } from './HelpPanel';

/**
 * Main CoPilot Component - Now Modular and Clean
 * Uses separate components for better organization and maintainability
 */
const CoPilot = () => {
  const { isOpen, setIsOpen, unreadCount } = useCoPilot();

  // Use the logic hook for all business logic
  const {
    messages,
    isTyping,
    copilotConfig,
    messagesEndRef,
    handleSendMessage,
    handleSuggestionClick,
    handleQuickAction,
    getContextSuggestions
  } = useCoPilotLogic();

  // Current tab state
  const [currentTab, setCurrentTab] = React.useState('chat');

  // Render tab content
  const renderTabContent = () => {
    switch (currentTab) {
      case 'chat':
        return (
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onSuggestionClick={handleSuggestionClick}
            onQuickAction={handleQuickAction}
            messagesEndRef={messagesEndRef}
          />
        );
      case 'insights':
        return (
          <InsightsPanel
            getContextSuggestions={getContextSuggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        );
      case 'help':
        return (
          <HelpPanel
            copilotConfig={copilotConfig}
            onSuggestionClick={handleSuggestionClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fade in={!isOpen}>
        <Tooltip title="Open Clinical Co-Pilot">
          <Fab
            color="primary"
            onClick={() => setIsOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000
            }}
          >
            <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
              <AIIcon />
            </Badge>
          </Fab>
        </Tooltip>
      </Fade>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', md: 400 },
            height: '100vh',
          },
        }}
      >
        <CoPilotDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          drawerContent={renderTabContent()}
        />
      </Drawer>
    </>
  );
};

export default CoPilot;

