import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

/**
 * Chat Input Component
 * Handles message input and sending
 */
export const ChatInput = ({ onSendMessage, onSuggestionClick, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about clinical genetics..."
          sx={{ mr: 1 }}
          disabled={disabled}
        />
        <IconButton
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          color="primary"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

