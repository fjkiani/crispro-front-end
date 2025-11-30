/**
 * Mechanism Chips Component
 * 
 * Displays 6 pathway mechanism chips:
 * - DDR | MAPK | PI3K | VEGF | IO | Efflux
 * - Pre-NGS: All gray with "Awaiting NGS" tooltip
 * - Post-NGS: Color-coded (green ≥0.7, yellow 0.4-0.7, gray <0.4)
 * - Click to expand and show contributing genes
 */
import React, { useState } from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  Popover,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const MechanismChips = ({ mechanism_map = {} }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);

  // Extract chips from mechanism_map
  const chips = mechanism_map?.chips || [];
  const status = mechanism_map?.status || 'awaiting_ngs';

  // If no chips, create default gray chips
  const displayChips = chips.length > 0 ? chips : [
    { pathway: 'DDR', burden: 0.0, color: 'default', label: '--', status: 'awaiting_ngs', tooltip: 'Awaiting NGS' },
    { pathway: 'MAPK', burden: 0.0, color: 'default', label: '--', status: 'awaiting_ngs', tooltip: 'Awaiting NGS' },
    { pathway: 'PI3K', burden: 0.0, color: 'default', label: '--', status: 'awaiting_ngs', tooltip: 'Awaiting NGS' },
    { pathway: 'VEGF', burden: 0.0, color: 'default', label: '--', status: 'awaiting_ngs', tooltip: 'Awaiting NGS' },
    { pathway: 'IO', burden: 0.0, color: 'default', label: '--', status: 'awaiting_ngs', tooltip: 'Awaiting NGS' },
    { pathway: 'Efflux', burden: 0.0, color: 'default', label: '--', status: 'awaiting_ngs', tooltip: 'Awaiting NGS' },
  ];

  const handleChipClick = (event, chip) => {
    setAnchorEl(event.currentTarget);
    setSelectedPathway(chip);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedPathway(null);
  };

  const getChipColor = (chip) => {
    if (chip.status === 'awaiting_ngs') {
      return 'default';
    }
    return chip.color || 'default';
  };

  const getChipVariant = (chip) => {
    if (chip.status === 'awaiting_ngs') {
      return 'outlined';
    }
    return 'filled';
  };

  const getChipSx = (chip) => {
    if (chip.status === 'awaiting_ngs') {
      return {
        borderStyle: 'dashed',
        opacity: 0.6,
      };
    }
    return {};
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
        {displayChips.map((chip, index) => (
          <Tooltip
            key={index}
            title={chip.tooltip || chip.pathway}
            arrow
          >
            <Chip
              label={`${chip.pathway}: ${chip.label || '--'}`}
              color={getChipColor(chip)}
              variant={getChipVariant(chip)}
              onClick={(e) => handleChipClick(e, chip)}
              sx={{
                minWidth: 100,
                cursor: 'pointer',
                ...getChipSx(chip),
              }}
            />
          </Tooltip>
        ))}
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
          {selectedPathway && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedPathway.pathway} Pathway
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedPathway.tooltip || 'No additional details available'}
              </Typography>
              {selectedPathway.status === 'computed' && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Burden Score: {(selectedPathway.burden * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    Status: {selectedPathway.status === 'computed' ? 'Computed from NGS data' : 'Awaiting NGS'}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Popover>

      {/* Status Message */}
      {status === 'awaiting_ngs' && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          🧬 All pathways awaiting NGS results
        </Typography>
      )}
    </Box>
  );
};

export default MechanismChips;







