/**
 * ToxicityChip Component
 * 
 * Displays toxicity risk assessment for germline variants.
 * Shows risk level, confidence, and key factors affecting toxicity.
 * 
 * Props:
 * - patient: { germlineVariants: Array }
 * - candidate: { type: string, moa: string, name?: string }
 * - context: { disease: string, tissue?: string }
 * - options: { evidence: boolean, profile: string }
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, Tooltip, Box, CircularProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useToxicity } from '../../components/ClinicalGenomicsCommandCenter/hooks/useToxicity';

const ToxicityChip = ({ patient, candidate, context, options = {} }) => {
  const { assessRisk, result, loading, error } = useToxicity();
  const [hasAssessed, setHasAssessed] = useState(false);

  // If no germline variants, don't show anything
  if (!patient?.germlineVariants || patient.germlineVariants.length === 0) {
    return null;
  }

  // If no drug candidate (MoA), don't assess
  if (!candidate?.moa && !candidate?.name) {
    return null;
  }

  // Assess toxicity when component mounts or props change
  useEffect(() => {
    if (!hasAssessed && patient?.germlineVariants?.length > 0 && (candidate?.moa || candidate?.name)) {
      const germlineVariants = patient.germlineVariants.map(v => ({
        gene: v.gene || v.hugo_gene_symbol,
        chrom: v.chrom || v.chromosome,
        pos: v.pos || v.position,
        ref: v.ref || v.reference,
        alt: v.alt || v.alternate,
        hgvs_p: v.hgvs_p || v.protein_change || v.variant
      })).filter(v => v.gene && v.chrom && v.pos);

      if (germlineVariants.length > 0) {
        assessRisk(
          germlineVariants,
          [], // somaticVariants - not needed for toxicity
          candidate.moa || 'unknown', // MoA
          context?.disease || 'unknown', // disease
          options
        ).then(() => {
          setHasAssessed(true);
        }).catch(err => {
          console.error('[ToxicityChip] Assessment failed:', err);
        });
      }
    }
  }, [patient, candidate, context, hasAssessed, assessRisk, options]);

  // Loading state
  if (loading) {
    return (
      <Tooltip title="Assessing toxicity risk...">
        <Chip
          icon={<CircularProgress size={14} />}
          label="Assessing..."
          size="small"
          variant="outlined"
          sx={{ fontSize: '12px' }}
        />
      </Tooltip>
    );
  }

  // Error state - show warning but don't break UI
  if (error && !result) {
    return (
      <Tooltip title={`Toxicity assessment error: ${error}`}>
        <Chip
          icon={<WarningIcon />}
          label="Risk (Error)"
          size="small"
          color="warning"
          variant="outlined"
          sx={{ fontSize: '12px' }}
        />
      </Tooltip>
    );
  }

  // No result yet (initial state)
  if (!result) {
    return null;
  }

  // Determine risk level from score
  const riskScore = result.risk_score || 0;
  const riskLevel = riskScore >= 0.5 ? 'HIGH' : riskScore >= 0.3 ? 'MODERATE' : 'LOW';
  const confidence = result.confidence || 0;
  const factors = result.factors || [];
  const mitigatingFoods = result.mitigating_foods || [];

  // Color coding
  const getColor = () => {
    if (riskLevel === 'HIGH') return 'error';
    if (riskLevel === 'MODERATE') return 'warning';
    return 'success';
  };

  const getIcon = () => {
    if (riskLevel === 'HIGH' || riskLevel === 'MODERATE') {
      return <WarningIcon />;
    }
    return <CheckCircleIcon />;
  };

  // Build tooltip content
  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 400 }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        Toxicity Risk Assessment (RUO)
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Risk Level:</strong> {riskLevel} ({(riskScore * 100).toFixed(0)}%)
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Confidence:</strong> {(confidence * 100).toFixed(0)}%
      </div>
      {result.reason && (
        <div style={{ marginBottom: '8px', fontSize: '12px', fontStyle: 'italic' }}>
          {result.reason}
        </div>
      )}
      {factors.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <strong>Key Factors:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '11px' }}>
            {factors.slice(0, 3).map((factor, idx) => (
              <li key={idx}>{factor.detail}</li>
            ))}
          </ul>
        </div>
      )}
      {mitigatingFoods.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '11px' }}>
          <strong>Mitigating Foods:</strong> {mitigatingFoods.length} recommendation(s)
        </div>
      )}
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#999' }}>
        ⚠️ Research Use Only - Not for clinical decision making
      </div>
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      <Chip
        icon={getIcon()}
        label={`${riskLevel} Risk`}
        size="small"
        color={getColor()}
        variant="outlined"
        sx={{ 
          cursor: 'help',
          fontSize: '12px',
          fontWeight: riskLevel === 'HIGH' ? 'bold' : 'normal'
        }}
      />
    </Tooltip>
  );
};

ToxicityChip.propTypes = {
  patient: PropTypes.shape({
    germlineVariants: PropTypes.arrayOf(PropTypes.object)
  }),
  candidate: PropTypes.shape({
    type: PropTypes.string,
    moa: PropTypes.string,
    name: PropTypes.string
  }),
  context: PropTypes.shape({
    disease: PropTypes.string,
    tissue: PropTypes.string
  }),
  options: PropTypes.shape({
    evidence: PropTypes.bool,
    profile: PropTypes.string
  })
};

export default ToxicityChip;


