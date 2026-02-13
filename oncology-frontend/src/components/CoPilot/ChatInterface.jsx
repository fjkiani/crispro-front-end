import React, { useRef, useEffect } from 'react';
import { Box, CircularProgress, Avatar, Paper } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { ChatInput } from './ChatInput';
import { MessageRenderer } from './MessageRenderer';

/**
 * Chat Interface Component
 * Handles the main chat functionality including messages, input, and typing indicators
 */
export const ChatInterface = ({
  messages,
  isTyping,
  onSendMessage,
  onSuggestionClick,
  onFileUpload, // ⚔️ Phase 9
  messagesEndRef
}) => {
  return (
    <>
      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map(message => (
          <MessageRenderer
            key={message.id}
            message={message}
            onQuickAction={onSendMessage}
          />
        ))}

        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
              <AIIcon />
            </Avatar>
            <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <span>Thinking...</span>
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        onSuggestionClick={onSuggestionClick}
        onFileUpload={onFileUpload} // ⚔️ Phase 9
        disabled={isTyping}
      />
    </>
  );
};

