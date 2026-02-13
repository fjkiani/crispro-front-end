import React from 'react';
import { Box, Typography, Card, Divider, Chip } from '@mui/material';
import { Science } from '@mui/icons-material';
import MutationScoringPipeline from '../MutationScoringPipeline';
import PathwayDisruptionMap from '../PathwayDisruptionMap';
import SyntheticLethalityFlow from '../SyntheticLethalityFlow';
import ResistanceProphetCard from '../ResistanceProphetCard';

/**
 * Digital Twin Section component
 * Displays mechanistic biology analysis using MOAT components
 */
export default function DigitalTwinSection({ digitalTwinData }) {
  if (!digitalTwinData) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Card sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          🧬 Digital Twin - Mechanistic Biology Analysis
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
          See the biology behind every prediction - This is the MOAT
        </Typography>
      </Card>

      {/* Section 1: Mutation Scoring Pipeline */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science color="primary" />
          1. How We Score Your Mutations
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          See the complete pipeline from genomic coordinates → Evo2 scoring → pathway assignment
        </Typography>
        <MutationScoringPipeline
          mutation={digitalTwinData.mutation}
          evo2Result={digitalTwinData.evo2Result}
          proteinImpact={digitalTwinData.proteinImpact}
          pathwayAssignment={digitalTwinData.pathwayAssignment}
        />
      </Box>

      {/* Section 2: Pathway Disruption Map */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science color="primary" />
          2. Your Pathway Disruption Map
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          See which DNA repair pathways are intact vs disrupted in your tumor
        </Typography>
        <PathwayDisruptionMap
          pathways={digitalTwinData.pathways}
          patientName="Your"
        />
      </Box>

      {/* Section 3: Synthetic Lethality Mechanism */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science color="primary" />
          3. Why PARP Inhibitors Work For You
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          See the complete synthetic lethality mechanism: BER loss → HR dependency → PARP blocks HR → cell death
        </Typography>
        <SyntheticLethalityFlow
          slData={digitalTwinData.syntheticLethality || null}
        />
      </Box>

      {/* Section 4: Resistance Prophet (Time Dimension) */}
      {digitalTwinData.resistancePrediction && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Science color="primary" />
            4. Resistance Timeline Prediction
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Predicting when resistance might emerge based on your specific DNA repair capacity
          </Typography>
          <ResistanceProphetCard resistance_prediction={digitalTwinData.resistancePrediction} />
        </Box>
      )}

      {/* Divider */}
      <Divider sx={{ my: 4 }}>
        <Chip label="Traditional Analysis Below" />
      </Divider>
    </Box>
  );
}
