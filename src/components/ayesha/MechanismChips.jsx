/**
 * Mechanism Chips Component (CIC v1)
 * 
 * Displays 6 pathway mechanism chips:
 * - DDR | MAPK | PI3K | VEGF | IO | Efflux
 * - Pre-NGS: All gray with "Awaiting NGS" tooltip
 * - Post-NGS: Color-coded based on burden value
 * - Honest UI: Explicitly handles missing inputs/null values
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  Popover,
  Paper,
  Stack,
  Alert
} from '@mui/material';
import { MechanismMapSchema } from '../../schemas/cic_v1';

// CIC v1: Component expects `mechanism_map` with `chips` list (Manager C9)
const MechanismChips = ({ mechanism_map = {} }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAxis, setSelectedAxis] = useState(null);

  // Runtime Validation (Dev Mode / Console Warning)
  useEffect(() => {
    const result = MechanismMapSchema.safeParse(mechanism_map);
    if (!result.success) {
      console.warn('❌ MechanismChips: CIC v1 Contract Violation', result.error);
    }
  }, [mechanism_map]);

  const { chips = [], status = 'awaiting_ngs', message } = mechanism_map || {};

  const handleChipClick = (event, chip) => {
    setAnchorEl(event.currentTarget);
    setSelectedAxis(chip);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedAxis(null);
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="flex-start">
        {chips.map((chip, idx) => {
          const axisName = chip.pathway || `Axis ${idx}`;
          const isAwaiting = chip.status === 'awaiting_ngs';

          return (
            <Box
              key={axisName}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}
            >
              <Chip
                label={chip.label || axisName}
                color={chip.color || 'default'}
                variant={isAwaiting ? 'outlined' : 'filled'}
                onClick={(e) => handleChipClick(e, chip)}
                sx={{
                  cursor: 'pointer',
                  borderStyle: isAwaiting ? 'dashed' : 'solid',
                  opacity: isAwaiting ? 0.6 : 1,
                  fontWeight: isAwaiting ? 'normal' : 'bold',
                  width: '100%',
                }}
              />
              {/* Always-visible inline description — shown by default, no hover required */}
              {!isAwaiting && chip.tooltip && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.4, textAlign: 'center', fontSize: '0.6rem', lineHeight: 1.2, maxWidth: 110 }}
                >
                  {chip.tooltip}
                </Typography>
              )}
              {isAwaiting && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ mt: 0.4, textAlign: 'center', fontSize: '0.6rem', lineHeight: 1.2 }}
                >
                  Awaiting NGS
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Popover for expanded details */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, minWidth: 300, maxWidth: 400 }}>
          {selectedAxis && (
            <Stack spacing={1}>
              <Typography variant="h6">
                {selectedAxis.pathway} Pathway
              </Typography>

              <Typography variant="body2">
                {selectedAxis.tooltip}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Chip
                  label={selectedAxis.label}
                  color={selectedAxis.color}
                  size="small"
                  variant={selectedAxis.status === 'awaiting_ngs' ? 'outlined' : 'filled'}
                />
                <Typography variant="caption" color="text.secondary">
                  Status: {selectedAxis.status}
                </Typography>
              </Box>

              {selectedAxis.status === 'computed' && (
                <Typography variant="caption" color="text.secondary">
                  Burden: {(selectedAxis.burden * 100).toFixed(0)}%
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
      </Popover>

      {/* Status Message */}
      {status === 'awaiting_ngs' && chips.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {message || "Global mechanism map awaiting NGS data."}
        </Alert>
      )}
      {/* Explicit Message (if chips present but status is awaiting/error) */}
      {message && chips.length > 0 && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default MechanismChips;







