import React from 'react';
import { Button, Chip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { SL_DEBUG } from './slUtils';

export function SlSignalBar({
  detected,
  signalState = 'none',
  receiptsOk,
  status,
  hasPayload,
  onOpenReceipts,
  onOpenFullJson,
}) {
  const label =
    signalState === 'consider'
      ? 'SL signal: Consider-tier candidate'
      : `SL signal: ${detected ? 'Detected' : 'Not detected'}`;
  const color = signalState === 'consider' ? 'warning' : (detected ? 'success' : 'default');
  const variant = signalState === 'consider' || detected ? 'filled' : 'outlined';

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
      <Chip
        icon={detected || signalState === 'consider' ? <CheckCircleIcon /> : <CancelIcon />}
        label={label}
        color={color}
        variant={variant}
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
