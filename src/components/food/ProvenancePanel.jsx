import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * ProvenancePanel - Displays complete analysis provenance
 * 
 * Shows:
 * - Run ID and timestamp
 * - Data sources used (PubMed papers, ChEMBL targets, treatment lines)
 * - Models applied (SAE, S/P/E, LLM)
 * - Confidence breakdown with visual progress bars
 * 
 * Props:
 * @param {Object} provenance - Complete provenance object from API
 */
export default function ProvenancePanel({ provenance }) {
  if (!provenance) {
    return null;
  }

  const {
    run_id,
    timestamp,
    data_sources = {},
    models_used = [],
    confidence_breakdown = {},
    method,
    disease_name,
    treatment_line,
    llm_papers_found
  } = provenance;

  // Format timestamp
  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return ts;
    }
  };

  const confidenceItems = [
    {
      label: 'Evidence Quality',
      value: confidence_breakdown.evidence_quality || 0,
      color: 'primary'
    },
    {
      label: 'Pathway Match',
      value: confidence_breakdown.pathway_match || 0,
      color: 'success'
    },
    {
      label: 'Safety Profile',
      value: confidence_breakdown.safety_profile || 0,
      color: 'warning'
    }
  ];

  return (
    <Card sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ScienceIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Analysis Provenance
        </Typography>
      </Box>

      {/* Run ID and Timestamp */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          <strong>Run ID:</strong> <code style={{ fontSize: '0.85em' }}>{run_id || 'N/A'}</code>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Timestamp:</strong> {formatTimestamp(timestamp)}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Data Sources */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Data Sources Used:
        </Typography>
        <List dense>
          {data_sources.pubmed_papers > 0 && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={`PubMed (${data_sources.pubmed_papers} papers)`}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          )}
          {data_sources.chembl_targets > 0 && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={`ChEMBL (${data_sources.chembl_targets} targets)`}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          )}
          {data_sources.treatment_lines > 0 && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={`Treatment History (${data_sources.treatment_lines} line${data_sources.treatment_lines > 1 ? 's' : ''})`}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          )}
        </List>
      </Box>

      {/* Models Applied */}
      {models_used.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Models Applied:
          </Typography>
          <List dense>
            {models_used.map((model, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <InfoIcon fontSize="small" color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${model.name}${model.version ? ` (${model.version})` : ''}${model.profile ? ` - ${model.profile}` : ''}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Confidence Breakdown */}
      {confidence_breakdown && Object.keys(confidence_breakdown).length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Confidence Breakdown:
          </Typography>
          {confidenceItems.map((item, idx) => (
            <Box key={idx} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {Math.round(item.value * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.value * 100}
                color={item.color}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Context Info */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {method && (
          <Chip 
            label={`Method: ${method}`} 
            size="small" 
            variant="outlined"
            color="primary"
          />
        )}
        {disease_name && (
          <Chip 
            label={`Disease: ${disease_name}`} 
            size="small" 
            variant="outlined"
          />
        )}
        {treatment_line && (
          <Chip 
            label={`Line: ${treatment_line}`} 
            size="small" 
            variant="outlined"
          />
        )}
        {llm_papers_found !== undefined && (
          <Chip 
            label={`LLM Papers: ${llm_papers_found}`} 
            size="small" 
            variant="outlined"
            color={llm_papers_found > 0 ? 'success' : 'default'}
          />
        )}
      </Box>

      {/* RUO Disclaimer */}
      {provenance.ruo_disclaimer && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="error.main" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningIcon fontSize="inherit" />
            {provenance.ruo_disclaimer}
          </Typography>
        </Box>
      )}
    </Card>
  );
}

ProvenancePanel.propTypes = {
  provenance: PropTypes.shape({
    run_id: PropTypes.string,
    timestamp: PropTypes.string,
    data_sources: PropTypes.shape({
      pubmed_papers: PropTypes.number,
      chembl_targets: PropTypes.number,
      treatment_lines: PropTypes.number
    }),
    models_used: PropTypes.arrayOf(PropTypes.object),
    confidence_breakdown: PropTypes.shape({
      evidence_quality: PropTypes.number,
      pathway_match: PropTypes.number,
      safety_profile: PropTypes.number
    }),
    method: PropTypes.string,
    disease_name: PropTypes.string,
    treatment_line: PropTypes.number,
    llm_papers_found: PropTypes.number,
    ruo_disclaimer: PropTypes.string
  })
};

