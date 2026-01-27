/**
 * KB Helper Tooltip Component
 * Displays KB helper text with provenance information
 */
import React, { useState } from 'react';
import { Tooltip, Box, Typography, Chip, IconButton } from '@mui/material';
import { Info, Verified, Warning } from '@mui/icons-material';

const KbHelperTooltip = ({ 
  helperText, 
  provenance = null, 
  variant = 'info',
  placement = 'top',
  children 
}) => {
  const [open, setOpen] = useState(false);

  const getIcon = () => {
    switch (variant) {
      case 'verified':
        return <Verified sx={{ fontSize: 16, color: '#10b981' }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 16, color: '#f59e0b' }} />;
      default:
        return <Info sx={{ fontSize: 16, color: '#3b82f6' }} />;
    }
  };

  const getTooltipContent = () => (
    <Box sx={{ maxWidth: 300, p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getIcon()}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
          Knowledge Base
        </Typography>
      </Box>
      
      <Typography variant="body2" sx={{ color: 'white', mb: provenance ? 1 : 0 }}>
        {helperText}
      </Typography>
      
      {provenance && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Source: {provenance.source || 'KB'}
          </Typography>
          {provenance.run_id && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
              Run ID: {provenance.run_id.slice(0, 8)}...
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Tooltip
      title={getTooltipContent()}
      placement={placement}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }
        },
        arrow: {
          sx: {
            color: 'rgba(0, 0, 0, 0.9)'
          }
        }
      }}
    >
      <Box
        component="span"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center',
          cursor: 'help'
        }}
      >
        {children}
        <IconButton
          size="small"
          sx={{ 
            ml: 0.5, 
            p: 0.25,
            color: variant === 'verified' ? '#10b981' : 
                   variant === 'warning' ? '#f59e0b' : '#3b82f6'
          }}
        >
          {getIcon()}
        </IconButton>
      </Box>
    </Tooltip>
  );
};

export default KbHelperTooltip;

