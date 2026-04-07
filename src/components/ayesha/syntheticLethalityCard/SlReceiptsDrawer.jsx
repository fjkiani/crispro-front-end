import React from 'react';
import { Box, Divider, Drawer, Typography } from '@mui/material';
import { prettyJson } from './slUtils';

export function SlReceiptsDrawer({ open, onClose, receipts }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 340, sm: 520 }, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          Receipts (verbatim; no inference)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These are excerpted directly from the SL payload.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
          `hgvs_resolution`
        </Typography>
        <Box
          component="pre"
          sx={{ mt: 1, p: 1.5, bgcolor: '#0b1220', color: '#e2e8f0', borderRadius: 2, overflow: 'auto' }}
        >
          {prettyJson(receipts.hgvs_resolution)}
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 2 }}>
          `variants_sent_to_engine`
        </Typography>
        <Box
          component="pre"
          sx={{ mt: 1, p: 1.5, bgcolor: '#0b1220', color: '#e2e8f0', borderRadius: 2, overflow: 'auto' }}
        >
          {prettyJson(receipts.variants_sent_to_engine)}
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 2 }}>
          `variants_excluded`
        </Typography>
        <Box
          component="pre"
          sx={{ mt: 1, p: 1.5, bgcolor: '#0b1220', color: '#e2e8f0', borderRadius: 2, overflow: 'auto' }}
        >
          {prettyJson(receipts.variants_excluded)}
        </Box>
      </Box>
    </Drawer>
  );
}
