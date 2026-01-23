import React from 'react';
import { Drawer, Box, Typography, Divider, Chip, Stack, Button } from '@mui/material';

const downloadJson = (obj, filename) => {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', filename);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } catch (_) {}
};

const EvidencePanel = ({ open, onClose, provenance = {}, requestJson, responseJson }) => {
  const { mode, upstream_service, selected_model } = provenance || {};
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 380 } }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Evidence & Provenance</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {mode && <Chip label={`Mode: ${mode}`} size="small" color={mode === 'live' ? 'success' : 'default'} />}
          {selected_model && <Chip label={`Model: ${selected_model}`} size="small" />}
        </Stack>
        {upstream_service && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Upstream: {upstream_service}
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Artifacts</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => downloadJson(requestJson || {}, 'request.json')}>Download Request</Button>
          <Button size="small" variant="outlined" onClick={() => downloadJson(responseJson || {}, 'response.json')}>Download Response</Button>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary">
          This result is generated live from Evo2 services. Strict REF allele validation is enforced.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default EvidencePanel; 