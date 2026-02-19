import React, { useState } from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import { Send as SendIcon, AttachFile as AttachIcon } from '@mui/icons-material';

/**
 * Chat Input Component
 * Handles message input and sending
 */
export const ChatInput = ({ onSendMessage, onSuggestionClick, onFileUpload, disabled }) => {
  const [message, setMessage] = useState('');
  const fileInputRef = React.useRef(null); // ⚔️ Phase 9

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      // Reset input
      e.target.value = null;
    }
  };

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
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".pdf,image/*" // ⚔️ Phase 9: Support PDF & Images
      />
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <Tooltip title="Upload Clinical Report (PDF/Image)">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            sx={{ mr: 1 }}
          >
            <AttachIcon />
          </IconButton>
        </Tooltip>
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

