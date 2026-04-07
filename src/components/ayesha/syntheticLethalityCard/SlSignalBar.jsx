import React from 'react';
import { Button, Chip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { SL_DEBUG } from './slUtils';

export function SlSignalBar({
  detected,
  receiptsOk,
  status,
  hasPayload,
  onOpenReceipts,
  onOpenFullJson,
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
      <Chip
        icon={detected ? <CheckCircleIcon /> : <CancelIcon />}
        label={`SL signal: ${detected ? 'Detected' : 'Not detected'}`}
        color={detected ? 'success' : 'default'}
        variant={detected ? 'filled' : 'outlined'}
      />
      <Chip
        icon={<ReceiptLongIcon />}
        label={`Receipts: ${receiptsOk ? 'OK' : status}`}
        color={receiptsOk ? 'success' : 'warning'}
        variant="outlined"
      />
      <Chip size="small" label="Bundle-derived" variant="outlined" />
      <Button size="small" variant="text" onClick={onOpenReceipts} disabled={!hasPayload}>
        Show raw SL receipts
      </Button>
      {SL_DEBUG && (
        <Button size="small" variant="text" color="secondary" onClick={onOpenFullJson} disabled={!hasPayload}>
          Full SL JSON (dev)
        </Button>
      )}
    </Stack>
  );
}
