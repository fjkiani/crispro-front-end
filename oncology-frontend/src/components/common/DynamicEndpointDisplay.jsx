import React from 'react';
import { Paper, Typography, Box, Chip, Divider } from '@mui/material';
import { Api, Science, Biotech } from '@mui/icons-material';

const KeyValueDisplay = ({ data, depth = 0 }) => {
  const indentStyle = { ml: depth * 2 };
  
  return (
    <Box sx={indentStyle}>
      {Object.entries(data).map(([key, value]) => (
        <Box key={key} sx={{ mb: 1 }}>
          {typeof value === 'object' && value !== null ? (
            <>
              <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </Typography>
              <KeyValueDisplay data={value} depth={depth + 1} />
            </>
          ) : (
            <Typography variant="body2">
              <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {String(value)}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

const DynamicEndpointDisplay = ({ endpointResult }) => {
  const { endpoint_name, title, headline, narrative, biotechRelevance, demoData } = endpointResult;

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', border: '1px solid #e0e0e0' }}>
      {/* API Endpoint Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Api color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {endpoint_name}
        </Typography>
      </Box>

      {/* Title and Headline */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      
      <Chip 
        label={headline} 
        color="success" 
        variant="filled" 
        sx={{ mb: 2, fontWeight: 'bold' }} 
      />

      {/* Narrative */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {narrative}
      </Typography>

      {/* Biotech Relevance */}
      {biotechRelevance && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Biotech color="secondary" sx={{ mr: 1, fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
              Biotech Impact:
            </Typography>
          </Box>
          <Typography variant="body2" color="secondary.dark" sx={{ mb: 2, fontStyle: 'italic' }}>
            {biotechRelevance}
          </Typography>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Raw Data Output */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Science color="action" sx={{ mr: 1, fontSize: 16 }} />
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Raw AI Output:
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          bgcolor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          fontFamily: 'monospace',
          fontSize: '0.85em',
          maxHeight: 200,
          overflow: 'auto'
        }}
      >
        <KeyValueDisplay data={demoData} />
      </Box>
    </Paper>
  );
};

export default DynamicEndpointDisplay; 