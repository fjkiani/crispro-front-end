/**
 * CarePlanActionButtons - Action buttons bar for care plan page
 * 
 * Provides buttons for generating plan, exporting data, sharing, and viewing provenance.
 */

import React from 'react';
import { Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';

export default function CarePlanActionButtons({
  loading,
  result,
  onGenerate,
  onExportJSON,
  onExportDossier,
  onShare,
  onViewProvenance
}) {
  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={onGenerate}
        disabled={loading}
        size="large"
        sx={{ px: 4 }}
      >
        {loading ? 'Generating Complete Care Plan...' : 'Generate Complete Care Plan'}
      </Button>
      {result && (
        <>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExportJSON}
            size="large"
          >
            Export JSON
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExportDossier}
            size="large"
            color="secondary"
          >
            Export Clinical Dossier
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={onShare}
            size="large"
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            onClick={onViewProvenance}
            size="large"
          >
            View Provenance
          </Button>
        </>
      )}
    </Box>
  );
}
