import React from 'react';
import { Box, Typography, Card, Divider, Chip, Alert } from '@mui/material';
import { Science } from '@mui/icons-material';
import MutationScoringPipeline from '../MutationScoringPipeline';
import PathwayDisruptionMap from '../PathwayDisruptionMap';
import SyntheticLethalityFlow from '../SyntheticLethalityFlow';
import ResistanceProphetCard from '../ResistanceProphetCard';

/**
 * NotAvailable — standard "not available" card for MOAT sections.
 * Shows reason and suggested next action. Never blank.
 */
function NotAvailable({ reason, nextAction }) {
  return (
    <Alert severity="info" sx={{ mt: 1 }}>
      <Typography variant="body2">{reason}</Typography>
      {nextAction && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <strong>Next step:</strong> {nextAction}
        </Typography>
      )}
    </Alert>
  );
}

/**
 * Digital Twin Section component
 * Displays mechanistic biology analysis using MOAT components
 * 
 * Three-state rendering for every section:
 *   1. Data present → render component
 *   2. Data absent → "Not available" with reason + next action
 *   3. Loading → handled by parent
 */
export default function DigitalTwinSection({ digitalTwinData }) {
  if (!digitalTwinData) return null;

  // Determine data availability for each section
  const hasMutationScoring = !!(
    digitalTwinData.mutation &&
    (digitalTwinData.evo2Result?.delta != null || digitalTwinData.proteinImpact?.type)
  );
  const hasPathways = !!(
    digitalTwinData.pathways && Object.keys(digitalTwinData.pathways).length > 0
  );
  const hasSL = !!(
    digitalTwinData.syntheticLethality || digitalTwinData.slDetection?.detected
  );
  const hasResistance = !!digitalTwinData.resistancePrediction;

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
        {hasMutationScoring ? (
          <MutationScoringPipeline
            mutation={digitalTwinData.mutation}
            evo2Result={digitalTwinData.evo2Result}
            proteinImpact={digitalTwinData.proteinImpact}
            pathwayAssignment={digitalTwinData.pathwayAssignment}
          />
        ) : (
          <NotAvailable
            reason="Evo2 mutation scoring not computed. Requires allele-complete somatic variants (genomic coordinates)."
            nextAction="Order tumor NGS to provide somatic variant coordinates for Evo2 scoring."
          />
        )}
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
        {hasPathways ? (
          <PathwayDisruptionMap
            pathways={digitalTwinData.pathways}
            patientName="Your"
          />
        ) : (
          <NotAvailable
            reason="Pathway disruption data not available. Requires SAE features from tumor NGS analysis."
            nextAction="Order HRD score or tumor NGS panel to unlock pathway disruption mapping."
          />
        )}
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
        {hasSL ? (
          <SyntheticLethalityFlow
            slData={digitalTwinData.syntheticLethality || null}
          />
        ) : (
          <NotAvailable
            reason="Synthetic lethality not assessed. Requires mutation coordinates and pathway analysis."
            nextAction="Order tumor NGS to enable synthetic lethality detection for your mutation profile."
          />
        )}
      </Box>

      {/* Section 4: Resistance Prophet (Time Dimension) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science color="primary" />
          4. Resistance Timeline Prediction
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Predicting when resistance might emerge based on your specific DNA repair capacity
        </Typography>
        {hasResistance ? (
          <ResistanceProphetCard resistance_prediction={digitalTwinData.resistancePrediction} />
        ) : (
          <NotAvailable
            reason="Resistance not assessed. Missing inputs: SAE features, HRD score, or treatment history."
            nextAction="Order HRD score and provide treatment history to enable resistance prediction."
          />
        )}
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 4 }}>
        <Chip label="Traditional Analysis Below" />
      </Divider>
    </Box>
  );
}
