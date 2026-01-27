import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';

export const SAEFeaturesCard = ({ result, loading, error }) => {
  const [expandedFeature, setExpandedFeature] = useState(false);
  
  // Loading state
  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          SAE Features (Explainability)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Extracting interpretable features...
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          SAE Features (Explainability)
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Paper>
    );
  }
  
  // No SAE features available
  if (!result?.sae_features || !result.sae_features.features || result.sae_features.features.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          SAE Features (Explainability)
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            No SAE features extracted. Tips: use Richer S/Fusion profile, set <code>include_sae_features: true</code>, and provide <code>hgvs_p</code> to enable insights.
          </Typography>
        </Alert>
      </Paper>
    );
  }
  
  const { features, boosting_features, limiting_features, overall_impact, provenance } = result.sae_features;
  
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
  
  // Helper: Feature activation strength label
  const getActivationLabel = (activation, threshold) => {
    const pct = (activation * 100).toFixed(0);
    if (threshold && activation >= threshold) {
      return `${pct}% (ACTIVE)`;
    }
    return `${pct}%`;
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">
          SAE Features (Explainability)
        </Typography>
        <Tooltip title="Sparse Autoencoder features extracted from real data sources (Evo2, Insights, Pathways, Fusion)">
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>
      
      {/* Overall Impact Summary */}
      <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: overall_impact > 0 ? 'success.light' : 'error.light', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          Overall SAE Impact: {overall_impact > 0 ? '+' : ''}{(overall_impact * 100).toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {boosting_features.length} boosting, {limiting_features.length} limiting
        </Typography>
      </Box>
      
      {/* Boosting Features */}
      {boosting_features.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ✅ Boosting Confidence ({boosting_features.length}):
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {features
              .filter(f => boosting_features.includes(f.id))
              .map((feature) => (
                <Chip
                  key={feature.id}
                  label={`${feature.name}: ${getActivationLabel(feature.activation, feature.threshold)}`}
                  color="success"
                  size="small"
                  icon={getImpactIcon('positive')}
                />
              ))}
          </Box>
        </Box>
      )}
      
      {/* Limiting Features */}
      {limiting_features.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ⚠️ Limiting Confidence ({limiting_features.length}):
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {features
              .filter(f => limiting_features.includes(f.id))
              .map((feature) => (
                <Chip
                  key={feature.id}
                  label={`${feature.name}: ${getActivationLabel(feature.activation, feature.threshold)}`}
                  color="warning"
                  size="small"
                  icon={getImpactIcon('negative')}
                />
              ))}
          </Box>
        </Box>
      )}
      
      {/* Feature Details (Expandable) */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Feature Details:
        </Typography>
        {features.map((feature, idx) => (
          <Accordion 
            key={feature.id} 
            expanded={expandedFeature === feature.id}
            onChange={(e, isExpanded) => setExpandedFeature(isExpanded ? feature.id : false)}
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
                  {getActivationLabel(feature.activation, feature.threshold)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" gutterBottom>
                <strong>Explanation:</strong> {feature.explanation}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                <strong>Provenance:</strong> {feature.provenance}
              </Typography>
              {feature.threshold && (
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>Activation Threshold:</strong> {(feature.threshold * 100).toFixed(0)}%
                </Typography>
              )}
              {feature.raw_value !== undefined && feature.raw_value !== null && (
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>Raw Value:</strong> {typeof feature.raw_value === 'object' ? JSON.stringify(feature.raw_value, null, 2) : feature.raw_value}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      {/* Provenance Accordion */}
      {provenance && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">SAE Provenance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" component="div">
              <strong>Method:</strong> {provenance.method}<br />
              <strong>Data Sources:</strong> {provenance.data_sources?.join(', ')}<br />
              <strong>Feature Count:</strong> {provenance.feature_count}<br />
              <strong>Boosting Count:</strong> {provenance.boosting_count}<br />
              <strong>Limiting Count:</strong> {provenance.limiting_count}<br />
              {provenance.gene && <><strong>Gene:</strong> {provenance.gene}<br /></>}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="caption">
          <strong>Research Use Only.</strong> SAE features are derived from real data (Evo2, Insights, Pathways, Fusion, ClinVar) 
          but interpretations are computational approximations. Clinical decisions require expert validation.
        </Typography>
      </Alert>
    </Paper>
  );
};

