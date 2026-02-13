/**
 * VUSResolutionSection - Section displaying VUS resolution cards
 * 
 * Wraps multiple VUSResolutionCard components in a container.
 */

import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import VUSResolutionCard from './VUSResolutionCard';

export default function VUSResolutionSection({ vusResults, patientProfile }) {
  if (!vusResults || Object.keys(vusResults).length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔍 Variant of Uncertain Significance (VUS) Resolution
        </Typography>
        {Object.entries(vusResults).map(([gene, vusData]) => {
          const vusMutation = patientProfile?.germline?.mutations?.find(
            m => m.gene === gene && m.classification === 'VUS'
          );
          if (!vusMutation) return null;
          
          return (
            <VUSResolutionCard
              key={gene}
              variant={{
                gene: gene,
                hgvs_c: vusMutation.variant,
                hgvs_p: vusMutation.protein_change
              }}
              vusData={vusData}
            />
          );
        })}
      </Card>
    </Box>
  );
}
