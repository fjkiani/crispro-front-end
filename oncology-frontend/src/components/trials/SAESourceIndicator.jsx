import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

/**
 * SAESourceIndicator Component
 * 
 * Displays whether mechanism fit uses TRUE SAE or PROXY SAE
 * 
 * @param {Object} props
 * @param {string} props.source - "true_sae" or "proxy_sae" (or undefined)
 * @param {string} props.size - "small" | "medium" (default: "small")
 */
const SAESourceIndicator = ({ source, size = "small" }) => {
  if (!source) return null;

  const isTrueSAE = source === "true_sae" || source === "true_sae_pathways";
  const isProxySAE = source === "proxy" || source === "proxy_sae";

  if (!isTrueSAE && !isProxySAE) return null;

  const tooltipText = isTrueSAE
    ? "TRUE SAE: Uses validated Evo2 features (AUROC 0.783). More accurate mechanism vectors from sequence-level signals."
    : "PROXY SAE: Uses gene mutation-based pathway aggregation. Baseline method for mechanism vector computation.";

  const chipProps = {
    size: size === "small" ? "small" : "medium",
    sx: {
      fontSize: size === "small" ? '0.65rem' : '0.75rem',
      height: size === "small" ? '20px' : '24px',
      fontWeight: 500
    }
  };

  return (
    <Tooltip title={tooltipText} arrow>
      <Chip
        icon={
          isTrueSAE ? (
            <CheckCircleIcon style={{ width: 14, height: 14, color: '#4caf50' }} />
          ) : (
            <InformationCircleIcon style={{ width: 14, height: 14, color: '#757575' }} />
          )
        }
        label={isTrueSAE ? "TRUE SAE" : "PROXY SAE"}
        color={isTrueSAE ? "success" : "default"}
        variant={isTrueSAE ? "filled" : "outlined"}
        {...chipProps}
      />
    </Tooltip>
  );
};

export default SAESourceIndicator;


