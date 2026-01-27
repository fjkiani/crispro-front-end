/**
 * KB Provenance Panel Component
 * Displays detailed provenance information for KB data
 */
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Collapse,
  IconButton,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Verified, 
  Info, 
  Timeline,
  Source
} from '@mui/icons-material';

const KbProvenancePanel = ({ 
  provenance, 
  title = "Knowledge Base Provenance",
  defaultExpanded = false 
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!provenance) {
    return null;
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'kb':
        return <Verified sx={{ color: '#10b981' }} />;
      case 'synthetic_demo':
        return <Info sx={{ color: '#3b82f6' }} />;
      default:
        return <Source sx={{ color: '#6b7280' }} />;
    }
  };

  const getSourceColor = (source) => {
    switch (source?.toLowerCase()) {
      case 'kb':
        return 'success';
      case 'synthetic_demo':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ 
      mt: 2, 
      background: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline sx={{ color: '#3b82f6' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
        }
        action={
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'white' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
        sx={{ 
          pb: 1,
          '& .MuiCardHeader-content': {
            overflow: 'hidden'
          }
        }}
      />
      
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            {/* Source Information */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                  Data Source
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSourceIcon(provenance.source)}
                  <Chip
                    label={provenance.source || 'Unknown'}
                    color={getSourceColor(provenance.source)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Grid>

            {/* Run ID */}
            {provenance.run_id && (
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                    Run ID
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      fontFamily: 'monospace',
                      background: 'rgba(255, 255, 255, 0.1)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    {provenance.run_id}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Timestamp */}
            {provenance.timestamp && (
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                    Retrieved
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {formatTimestamp(provenance.timestamp)}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Cache Status */}
            {provenance.cached !== undefined && (
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                    Cache Status
                  </Typography>
                  <Chip
                    label={provenance.cached ? 'Cached' : 'Live'}
                    color={provenance.cached ? 'warning' : 'success'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            )}

            {/* Curator Information */}
            {provenance.curator && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                    Curated By
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {provenance.curator}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Additional Metadata */}
            {provenance.metadata && Object.keys(provenance.metadata).length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                  Additional Metadata
                </Typography>
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  p: 2,
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  <pre style={{ 
                    color: 'white', 
                    fontSize: '0.75rem',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {JSON.stringify(provenance.metadata, null, 2)}
                  </pre>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default KbProvenancePanel;

