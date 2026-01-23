import React from 'react';
import { Paper, Box, Typography, Stack, Button, Chip } from '@mui/material';

const AssistantPanel = ({ modelId, results, onWarmup, onRunProfileAll, onRunProbeAll }) => {
  const hasResults = Boolean(results && Array.isArray(results.detailed_analysis));
  const refHints = [];
  if (hasResults) {
    for (const d of results.detailed_analysis) {
      const vi = d?.original_variant_data?.variant_info || '';
      if (!/^[^\s]+\s+[ACGT]>[ACGT]$/.test(vi)) {
        refHints.push(`${d?.gene || 'GENE'}: check REF>ALT format`);
      }
    }
  }
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1">Assistant</Typography>
        {modelId && <Chip size="small" label={`Model: ${modelId}`} />}
      </Stack>
      <Typography variant="body2" sx={{ mb: 1 }}>
        - Warm the selected model to reduce cold-start latency.<br/>
        - After analysis, run Delta Profile and Sensitivity Probe for interpretability.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button size="small" variant="outlined" onClick={onWarmup}>Warm Model</Button>
        <Button size="small" variant="outlined" onClick={onRunProfileAll} disabled={!hasResults}>Run Profiles (all)</Button>
        <Button size="small" variant="outlined" onClick={onRunProbeAll} disabled={!hasResults}>Run Probes (all)</Button>
      </Stack>
      {refHints.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Input hints:<br/>
            {refHints.map((h, i) => (<div key={i}>• {h}</div>))}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AssistantPanel; 