/**
 * Provenance Card Component
 * 
 * Displays run metadata for reproducibility:
 * - Run ID (copyable)
 * - Timestamp
 * - Methods used
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

export default function ProvenanceCard({ provenance }) {
  const [copied, setCopied] = useState(false);

  if (!provenance) {
    return null;
  }

  const runId = provenance.run_id || provenance.runId || 'N/A';
  const timestamp = provenance.timestamp || provenance.created_at || 'N/A';
  const methodsUsed = provenance.methods_used || provenance.methods || [];

  const handleCopyRunId = () => {
    navigator.clipboard.writeText(runId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Provenance</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Run metadata for reproducibility and tracking
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Run ID */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Run ID
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  flex: 1
                }}
              >
                {runId}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy Run ID'}>
                <IconButton
                  size="small"
                  onClick={handleCopyRunId}
                  color={copied ? 'success' : 'default'}
                >
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Timestamp */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Timestamp
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {new Date(timestamp).toLocaleString()}
            </Typography>
          </Box>

          {/* Methods Used */}
          {methodsUsed.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Methods Used ({methodsUsed.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {methodsUsed.map((method, idx) => (
                  <Chip
                    key={idx}
                    label={method}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Run ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Card>
  );
}















