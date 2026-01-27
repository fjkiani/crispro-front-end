/**
 * AyeshaSAEFeaturesCard Component
 * 
 * Displays SAE features from complete_care_v2 for Ayesha's page.
 * Simplified version of SAEFeaturesCard adapted for complete_care_v2 response format.
 */
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import PsychologyIcon from '@mui/icons-material/Psychology';

const AyeshaSAEFeaturesCard = ({ sae_features }) => {
  const [expandedFeature, setExpandedFeature] = useState(null);

  if (!sae_features) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PsychologyIcon color="primary" />
          <Typography variant="h6">
            SAE Features (Explainability)
          </Typography>
          <Tooltip title="Sparse Autoencoder features extracted from genomic data">
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
        <Alert severity="info" sx={{ mt: 2 }}>
          SAE features not available. NGS data may be required to extract interpretable features.
        </Alert>
      </Paper>
    );
  }

  // Handle different response formats
  const features = sae_features.features || [];
  const boosting_features = sae_features.boosting_features || [];
  const limiting_features = sae_features.limiting_features || [];
  const overall_impact = sae_features.overall_impact || 0;
  const dna_repair_capacity = sae_features.dna_repair_capacity;
  const pathway_burden = sae_features.pathway_burden;
  const mechanism_vector = sae_features.mechanism_vector;
  const provenance = sae_features.provenance || {};

  // Helper: Get impact color
  const getImpactColor = (impact) => {
    switch(impact) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      default: return 'default';
    }
  };

  // Helper: Get impact icon
  const getImpactIcon = (impact) => {
    return impact === 'positive' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />;
  };

  // Helper: Format activation percentage
  const formatActivation = (activation, threshold) => {
    const pct = (activation * 100).toFixed(0);
    if (threshold && activation >= threshold) {
      return `${pct}% (ACTIVE)`;
    }
    return `${pct}%`;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <PsychologyIcon color="primary" />
        <Typography variant="h6">
          SAE Features (Explainability)
        </Typography>
        <Tooltip title="Sparse Autoencoder features extracted from genomic data sources">
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>

      {/* Overall Impact Summary */}
      {overall_impact !== undefined && (
        <Box sx={{ mb: 3, p: 2, bgcolor: overall_impact > 0 ? 'success.light' : overall_impact < 0 ? 'error.light' : 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Overall SAE Impact
          </Typography>
          <Typography variant="h6" color={overall_impact > 0 ? 'success.main' : overall_impact < 0 ? 'error.main' : 'text.primary'}>
            {overall_impact > 0 ? '+' : ''}{(overall_impact * 100).toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {boosting_features.length} boosting features, {limiting_features.length} limiting features
          </Typography>
        </Box>
      )}

      {/* DNA Repair Capacity */}
      {dna_repair_capacity !== undefined && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            DNA Repair Capacity
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100, Math.max(0, (dna_repair_capacity * 100)))} 
              sx={{ flex: 1, height: 8, borderRadius: 1 }}
              color={dna_repair_capacity > 0.7 ? 'success' : dna_repair_capacity > 0.4 ? 'warning' : 'error'}
            />
            <Typography variant="body2" fontWeight="bold">
              {(dna_repair_capacity * 100).toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      )}

      {/* Pathway Burden */}
      {pathway_burden && typeof pathway_burden === 'object' && Object.keys(pathway_burden).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Pathway Burden
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(pathway_burden).map(([pathway, burden]) => (
              <Chip
                key={pathway}
                label={`${pathway}: ${(burden * 100).toFixed(0)}%`}
                color={burden > 0.7 ? 'error' : burden > 0.4 ? 'warning' : 'default'}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Mechanism Vector */}
      {mechanism_vector && typeof mechanism_vector === 'object' && Object.keys(mechanism_vector).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Mechanism Vector
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(mechanism_vector).map(([mechanism, value]) => (
              <Chip
                key={mechanism}
                label={`${mechanism}: ${value.toFixed(2)}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Boosting Features */}
      {boosting_features.length > 0 && features.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            ✅ Boosting Confidence ({boosting_features.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {features
              .filter(f => boosting_features.includes(f.id || f.name))
              .map((feature) => (
                <Chip
                  key={feature.id || feature.name}
                  label={`${feature.name}: ${formatActivation(feature.activation, feature.threshold)}`}
                  color="success"
                  size="small"
                  icon={getImpactIcon('positive')}
                />
              ))}
          </Box>
        </Box>
      )}

      {/* Limiting Features */}
      {limiting_features.length > 0 && features.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            ⚠️ Limiting Confidence ({limiting_features.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {features
              .filter(f => limiting_features.includes(f.id || f.name))
              .map((feature) => (
                <Chip
                  key={feature.id || feature.name}
                  label={`${feature.name}: ${formatActivation(feature.activation, feature.threshold)}`}
                  color="warning"
                  size="small"
                  icon={getImpactIcon('negative')}
                />
              ))}
          </Box>
        </Box>
      )}

      {/* Feature Details (Expandable) */}
      {features.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="sule2" fontWeight="bold" gutterBottom>
            Feature Details
          </Typography>
          {features.slice(0, 5).map((feature, idx) => (
            <Accordion
              key={feature.id || idx}
              expanded={expandedFeature === (feature.id || idx)}
              onChange={(e, isExpanded) => setExpandedFeature(isExpanded ? (feature.id || idx) : null)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Chip
                    label={feature.name}
                    color={getImpactColor(feature.impact)}
                    size="small"
                    icon={getImpactIcon(feature.impact)}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {formatActivation(feature.activation, feature.threshold)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {feature.explanation && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Explanation:</strong> {feature.explanation}
                  </Typography>
                )}
                {feature.provenance && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    <strong>Provenance:</strong> {feature.provenance}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
          {features.length > 5 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              +{features.length - 5} more features available
            </Typography>
          )}
        </Box>
      )}

      {/* Provenance */}
      {provenance && Object.keys(provenance).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Data source: {provenance.status || 'Generated'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AyeshaSAEFeaturesCard;
