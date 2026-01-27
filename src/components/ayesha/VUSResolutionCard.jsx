/**
 * VUSResolutionCard Component
 * 
 * Displays VUS (Variant of Uncertain Significance) resolution results.
 * Shows Evo2 scores, ClinVar classification, resolution status, and next actions.
 * 
 * Props:
 * - variant: { gene, hgvs_c?, hgvs_p? }
 * - vusData: Response from /api/vus/identify endpoint
 * - onResolve: Optional callback when user wants to run resolution
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Button,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export default function VUSResolutionCard({ variant, vusData, onResolve, loading = false }) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    if (!onResolve) return;
    setResolving(true);
    try {
      await onResolve(variant);
    } catch (err) {
      console.error('VUS resolution failed:', err);
    } finally {
      setResolving(false);
    }
  };

  if (loading || resolving) {
    return (
      <Card variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Analyzing {variant.gene} variant...</Typography>
        </Box>
      </Card>
    );
  }

  if (!vusData) {
    return (
      <Card variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <HelpIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {variant.gene} - {variant.hgvs_p || variant.hgvs_c || 'VUS'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Status: VUS (Variant of Uncertain Significance)
            </Typography>
          </Box>
          {onResolve && (
            <Button
              variant="contained"
              startIcon={<ScienceIcon />}
              onClick={handleResolve}
              disabled={resolving}
            >
              Run Evo2 Analysis
            </Button>
          )}
        </Box>
      </Card>
    );
  }

  // Handle VUS API response structure (triage object contains resolution info)
  const triage = vusData.triage || {};
  const isResolved = triage.status === 'resolved_by_prior' || triage.status === 'resolved_by_evo2';
  const resolutionMethod = triage.resolution_path || triage.status || 'pending';
  const verdict = triage.verdict || 'Uncertain significance';
  const confidence = triage.confidence || 0.4;
  const reasons = triage.reasons || [];
  const nextStep = triage.next_step || null;

  return (
    <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {isResolved ? (
          <CheckCircleIcon color="success" />
        ) : (
          <WarningIcon color="warning" />
        )}
        <Typography variant="subtitle1" fontWeight="bold">
          {variant.gene} - {variant.hgvs_p || variant.hgvs_c || 'VUS'}
        </Typography>
        <Chip
          label={isResolved ? 'Resolved' : 'Still VUS'}
          color={isResolved ? 'success' : 'warning'}
          size="small"
        />
      </Box>

      {isResolved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Variant Resolved</AlertTitle>
          <Typography variant="body2">
            This variant has been classified via <strong>{resolutionMethod}</strong>.
          </Typography>
        </Alert>
      )}

      {!isResolved && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>{verdict}</AlertTitle>
          <Typography variant="body2" gutterBottom>
            Confidence: {(confidence * 100).toFixed(0)}%
          </Typography>
          {reasons.length > 0 && (
            <Box component="ul" sx={{ m: 0, pl: 2, mt: 1 }}>
              {reasons.map((reason, idx) => (
                <li key={idx}>
                  <Typography variant="caption">{reason}</Typography>
                </li>
              ))}
            </Box>
          )}
          {nextStep && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
              Next step: {nextStep}
            </Typography>
          )}
        </Alert>
      )}

      {/* VEP Predictions (PolyPhen/SIFT) */}
      {vusData.vep && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Computational Predictions:
          </Typography>
          {vusData.vep.polyphen_prediction && (
            <Typography variant="body2">
              <strong>PolyPhen:</strong> {vusData.vep.polyphen_prediction}
              {vusData.vep.polyphen_score && ` (${(vusData.vep.polyphen_score * 100).toFixed(1)}%)`}
            </Typography>
          )}
          {vusData.vep.sift_prediction && (
            <Typography variant="body2">
              <strong>SIFT:</strong> {vusData.vep.sift_prediction}
              {vusData.vep.sift_score !== undefined && ` (${vusData.vep.sift_score})`}
            </Typography>
          )}
          {vusData.vep.impact && (
            <Typography variant="body2">
              <strong>Impact:</strong> {vusData.vep.impact}
            </Typography>
          )}
        </Box>
      )}

      {vusData.evo2_score !== undefined && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Evo2 Sequence Disruption Score:</strong>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={typeof vusData.evo2_score === 'number' ? vusData.evo2_score * 100 : 0}
              sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
              color={typeof vusData.evo2_score === 'number' && vusData.evo2_score > 0.8 ? 'error' : 'primary'}
            />
            <Typography variant="body2" fontWeight="medium">
              {typeof vusData.evo2_score === 'number' 
                ? (vusData.evo2_score * 100).toFixed(1) + '%'
                : vusData.evo2_score}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Higher scores indicate greater sequence disruption (more likely damaging)
          </Typography>
        </Box>
      )}

      {vusData.clinvar_classification && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>ClinVar Classification:</strong> {vusData.clinvar_classification}
          </Typography>
        </Box>
      )}

      {vusData.alphamissense_score && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>AlphaMissense Score:</strong> {typeof vusData.alphamissense_score === 'number'
              ? (vusData.alphamissense_score * 100).toFixed(1) + '%'
              : vusData.alphamissense_score}
          </Typography>
        </Box>
      )}

      {vusData.next_actions && vusData.next_actions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Recommended Next Steps:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3 }}>
            {vusData.next_actions.map((action, idx) => (
              <li key={idx}>
                <Typography variant="body2">
                  {/* Handle both string and object formats */}
                  {typeof action === 'string' 
                    ? action 
                    : (
                      <>
                        <strong>{action.label || action.action}</strong>
                        {action.description && `: ${action.description}`}
                      </>
                    )
                  }
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}

      {vusData.pathway && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Resolution path: <strong>{vusData.pathway}</strong>
          </Typography>
        </Box>
      )}
    </Card>
  );
}
