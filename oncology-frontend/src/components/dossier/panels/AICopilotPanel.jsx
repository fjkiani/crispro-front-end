import React from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  border: 'none',
  borderRadius: 12,
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: '0 8px 32px rgba(96, 165, 250, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(96, 165, 250, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    color: 'rgba(255,255,255,0.5)',
    boxShadow: 'none',
  }
}));

const MessageBubble = styled(Paper)(({ isUser }) => ({
  padding: '16px 24px',
  margin: '12px 0',
  borderRadius: isUser ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
  background: isUser 
    ? 'linear-gradient(135deg, #60a5fa, #3b82f6)' 
    : 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08))',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${isUser ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255,255,255,0.15)'}`,
  maxWidth: isUser ? '80%' : '90%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  color: 'white',
  boxShadow: isUser 
    ? '0 8px 32px rgba(96, 165, 250, 0.25)' 
    : '0 8px 32px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: isUser 
      ? '0 12px 40px rgba(96, 165, 250, 0.3)' 
      : '0 12px 40px rgba(0,0,0,0.2)',
  }
}));

export const AICopilotPanel = ({ onAction, isAnalyzing, currentAction, conversation }) => {
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  const isDisabled = isAnalyzing || currentAction.buttonText === 'Campaign Complete';

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Avatar sx={{ 
          bgcolor: 'linear-gradient(135deg, #34d399, #10b981)', 
          mr: 2,
          width: 48,
          height: 48,
          boxShadow: '0 8px 32px rgba(52, 211, 153, 0.3)'
        }}>
          <SmartToyIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
                      <Typography variant="h6" sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: '1.3rem'
            }}>
              ZETA COMMAND CENTER
            </Typography>
            <Typography variant="body2" sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem'
            }}>
              {isAnalyzing ? 'Executing operational protocols...' : 'All systems armed • Ready for deployment'}
            </Typography>
        </Box>
      </Box>

      {/* Conversation Area */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        py: 1,
        mb: 3,
        minHeight: '320px',
        maxHeight: '520px',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '4px',
          margin: '8px 0',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.6), rgba(96, 165, 250, 0.3))',
          borderRadius: '4px',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(96, 165, 250, 0.5))',
          },
        },
      }}>
        {conversation.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            color: 'rgba(255,255,255,0.6)'
          }}>
            <RocketLaunchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Command Center Armed
            </Typography>
            <Typography variant="body2">
              Oracle • Forge • Boltz engines ready for therapeutic conquest
            </Typography>
          </Box>
        )}
        
        {conversation.map((msg, index) => (
          <Box key={index} sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
            mb: 2
          }}>
            {/* Message Type Indicator */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              ml: msg.type === 'user' ? 0 : 1,
              mr: msg.type === 'user' ? 1 : 0
            }}>
              <Avatar sx={{ 
                width: 24, 
                height: 24, 
                mr: msg.type === 'user' ? 0 : 1,
                ml: msg.type === 'user' ? 1 : 0,
                bgcolor: msg.type === 'user' ? '#60a5fa' : '#22c55e',
                fontSize: '0.7rem'
              }}>
                {msg.type === 'user' ? '👤' : '🤖'}
              </Avatar>
                             <Typography variant="caption" sx={{ 
                 color: 'rgba(255,255,255,0.6)',
                 fontSize: '0.75rem',
                 fontWeight: 500,
                 order: msg.type === 'user' ? -1 : 1
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
                lineHeight: 1.6,
                fontSize: msg.type === 'user' ? '1rem' : '0.98rem',
                fontWeight: msg.type === 'user' ? 500 : 400,
                letterSpacing: '0.01em'
              }}>
                {msg.message}
              </Typography>
            </MessageBubble>
          </Box>
        ))}

        {isAnalyzing && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
          }}>
            <CircularProgress 
              size={32} 
              sx={{ 
                color: '#60a5fa',
                mr: 2
              }} 
            />
            <Typography sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic',
              fontSize: '0.9rem'
            }}>
              Zeta engines executing protocols...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Button */}
      <Box sx={{ textAlign: 'center' }}>
        <StyledButton
          variant="contained"
          size="large"
          onClick={handleAction}
          disabled={isDisabled}
          startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
          fullWidth
        >
          {isAnalyzing ? 'Analyzing...' : currentAction.buttonText || 'Launch Analysis'}
        </StyledButton>
      </Box>
    </Box>
  );
};

export default AICopilotPanel; 