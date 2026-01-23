import React, { useEffect, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

// Function to format message text with highlights
const formatMessage = (text, isUser = false) => {
  if (!text) return text;
  
  // Split text by **bold** and 'quoted' patterns
  const parts = text.split(/(\*\*[^*]+\*\*|'[^']+')/).filter(Boolean);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold text - remove ** and highlight
      const content = part.slice(2, -2);
      return (
        <Box
          key={index}
          component="span"
          sx={{
            color: isUser ? '#fbbf24' : '#34d399',
            fontWeight: 900,
            background: isUser 
              ? 'rgba(251, 191, 36, 0.2)' 
              : 'rgba(52, 211, 153, 0.2)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: `1px solid ${isUser ? 'rgba(251, 191, 36, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {content}
        </Box>
      );
    } else if (part.startsWith("'") && part.endsWith("'")) {
      // Quoted text - remove quotes and highlight
      const content = part.slice(1, -1);
      return (
        <Box
          key={index}
          component="span"
          sx={{
            color: isUser ? '#60a5fa' : '#f59e0b',
            fontWeight: 700,
            background: isUser 
              ? 'rgba(96, 165, 250, 0.2)' 
              : 'rgba(245, 158, 11, 0.2)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: `1px solid ${isUser ? 'rgba(96, 165, 250, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            fontStyle: 'italic',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          "{content}"
        </Box>
      );
    } else {
      // Regular text
      return <span key={index}>{part}</span>;
    }
  });
};

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  border: 'none',
  borderRadius: 16,
  padding: '20px 40px',
  fontSize: '1.3rem',
  fontWeight: 900,
  textTransform: 'none',
  boxShadow: '0 8px 32px rgba(96, 165, 250, 0.4)',
  transition: 'all 0.3s ease',
  color: 'white',
  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    transform: 'translateY(-3px)',
    boxShadow: '0 16px 48px rgba(96, 165, 250, 0.5)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
    color: 'rgba(255,255,255,0.6)',
    boxShadow: 'none',
  }
}));

const MessageBubble = styled(Paper)(({ isUser }) => ({
  padding: '24px 32px',
  margin: '16px 0',
  borderRadius: isUser ? '28px 28px 12px 28px' : '28px 28px 28px 12px',
  background: isUser 
    ? 'linear-gradient(135deg, #1e40af, #1d4ed8)' 
    : 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
  backdropFilter: 'blur(20px)',
  border: isUser 
    ? '2px solid rgba(59, 130, 246, 0.6)' 
    : '2px solid rgba(255,255,255,0.25)',
  maxWidth: isUser ? '85%' : '95%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  color: 'white',
  boxShadow: isUser 
    ? '0 12px 40px rgba(59, 130, 246, 0.3)' 
    : '0 12px 40px rgba(0,0,0,0.4)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isUser 
      ? '0 16px 48px rgba(59, 130, 246, 0.4)' 
      : '0 16px 48px rgba(0,0,0,0.5)',
  }
}));

export const AICopilotPanel = ({ onAction, isAnalyzing, currentAction, conversation }) => {
  const listRef = useRef(null);

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    // Smooth scroll to bottom
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [conversation, isAnalyzing]);

  const isDisabled = isAnalyzing || currentAction.buttonText === 'Campaign Complete';

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      p: 4,
      background: 'linear-gradient(135deg, rgba(15, 25, 35, 0.8), rgba(25, 35, 50, 0.6))',
      borderRadius: '20px',
      border: '2px solid rgba(96, 165, 250, 0.2)'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        pb: 3,
        borderBottom: '2px solid rgba(255,255,255,0.15)'
      }}>
        <Avatar sx={{ 
          bgcolor: 'linear-gradient(135deg, #34d399, #10b981)', 
          mr: 3,
          width: 60,
          height: 60,
          boxShadow: '0 12px 40px rgba(52, 211, 153, 0.4)',
          border: '2px solid rgba(52, 211, 153, 0.3)'
        }}>
          <SmartToyIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{
            fontWeight: 900,
            color: 'white',
            fontSize: '1.8rem',
            letterSpacing: '0.01em',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            mb: 0.5
          }}>
            ZETA COMMAND CENTER
          </Typography>
          <Typography variant="h6" sx={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '1.2rem',
            fontWeight: 500,
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
            {isAnalyzing ? 'Executing protocols...' : 'All systems ready for deployment'}
          </Typography>
        </Box>
      </Box>

      {/* Conversation Area */}
      <Box ref={listRef} sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        py: 2,
        mb: 4,
        minHeight: '400px',
        maxHeight: '600px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        '&::-webkit-scrollbar': {
          width: '12px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '6px',
          margin: '8px 0',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(96, 165, 250, 0.4))',
          borderRadius: '6px',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 1), rgba(96, 165, 250, 0.6))',
          },
        },
      }}>
        {conversation.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            color: 'rgba(255,255,255,0.8)'
          }}>
            <RocketLaunchIcon sx={{ 
              fontSize: 64, 
              mb: 3, 
              opacity: 0.7,
              filter: 'drop-shadow(0 4px 12px rgba(96, 165, 250, 0.3))'
            }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 900, 
              mb: 2, 
              fontSize: '1.5rem',
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              Command Center Armed
            </Typography>
            <Typography variant="h6" sx={{ 
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.85)',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              Oracle • Forge • Boltz engines ready for deployment
            </Typography>
          </Box>
        )}
        
        {conversation.map((msg, index) => (
          <Box key={index} sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
            mb: 3
          }}>
            {/* Message Type Indicator */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1.5,
              ml: msg.type === 'user' ? 0 : 1,
              mr: msg.type === 'user' ? 1 : 0
            }}>
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                mr: msg.type === 'user' ? 0 : 1.5,
                ml: msg.type === 'user' ? 1.5 : 0,
                bgcolor: msg.type === 'user' ? '#1e40af' : '#059669',
                fontSize: '1rem',
                border: `2px solid ${msg.type === 'user' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(5, 150, 105, 0.5)'}`,
                boxShadow: `0 4px 16px ${msg.type === 'user' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(5, 150, 105, 0.3)'}`
              }}>
                {msg.type === 'user' ? '👤' : '🤖'}
              </Avatar>
              <Typography variant="body1" sx={{ 
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700,
                order: msg.type === 'user' ? -1 : 1,
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}>
                {msg.type === 'user' ? 'Commander' : 'Zeta Command'}
              </Typography>
            </Box>
            
            {/* Message Bubble */}
            <MessageBubble 
              isUser={msg.type === 'user'}
              elevation={0}
            >
              <Typography variant="body1" sx={{ 
                lineHeight: 1.8,
                fontSize: '1.2rem',
                fontWeight: msg.type === 'user' ? 600 : 500,
                letterSpacing: '0.01em',
                color: 'white',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}>
                {formatMessage(msg.message, msg.type === 'user')}
              </Typography>
            </MessageBubble>
          </Box>
        ))}

        {isAnalyzing && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mt: 2, 
            px: 3,
            py: 2,
            background: 'rgba(96, 165, 250, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(96, 165, 250, 0.3)'
          }}>
            <CircularProgress size={24} sx={{ color: '#60a5fa' }} />
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontSize: '1.1rem',
              fontWeight: 600,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              Zeta engines executing protocols...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Button */}
      <StyledButton onClick={handleAction} disabled={isDisabled} fullWidth>
        {currentAction.buttonText}
      </StyledButton>
    </Box>
  );
};

export default AICopilotPanel; 