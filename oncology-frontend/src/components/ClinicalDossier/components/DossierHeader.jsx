import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { Info, Assessment, CalendarToday } from '@mui/icons-material';

/**
 * DossierHeader Component
 * 
 * Displays patient info, analysis metadata, and critical scope banner
 * 
 * @param {Object} props
 * @param {Object} props.dossierData - Dossier data object
 * @param {string} props.patientId - Optional patient ID
 * @param {string} props.patientName - Optional patient name
 */
const DossierHeader = ({ dossierData, patientId, patientName }) => {
  const reportId = dossierData?.report_id || 'N/A';
  const analysisDate = dossierData?.analysis_date 
    ? new Date(dossierData.analysis_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString();

  return (
    <Box>
      {/* CRITICAL: Scope Banner - Must be prominent */}
      <Alert 
        severity="info" 
        icon={<Info />}
        sx={{ 
          mb: 3,
          backgroundColor: '#e3f2fd',
          borderLeft: '4px solid #1976d2',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Mechanism Alignment Assessment, Not Outcome Prediction
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          These scores reflect how well each drug targets the disrupted pathways in this tumor.
          They do <strong>NOT</strong> predict response rates or survival outcomes.
        </Typography>
        <Box sx={{ mt: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            ✓ Drug ranking accuracy: 100% Top-5 (validated)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
            ⚠ Outcome prediction: NOT VALIDATED (r=0.037 with PFS)
          </Typography>
        </Box>
      </Alert>

      {/* Patient Info and Metadata */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Clinical Genomic Analysis Dossier
            </Typography>
            {patientName && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                Patient: {patientName}
              </Typography>
            )}
            {patientId && (
              <Typography variant="body2" color="text.secondary">
                Patient ID: {patientId}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Assessment />}
              label={`Report ID: ${reportId}`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<CalendarToday />}
              label={`Analysis Date: ${analysisDate}`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Research Use Only"
            color="warning"
            size="small"
          />
          <Chip
            label="Mechanism Alignment Assessment"
            color="info"
            size="small"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DossierHeader;


