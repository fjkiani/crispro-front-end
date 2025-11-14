import React, { useState } from 'react';
import { Box, Tab, Tabs, Paper, Alert, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import GermlineStatusBanner from './GermlineStatusBanner';
import TumorQuickIntake from './TumorQuickIntake';
import TumorNGSUpload from './TumorNGSUpload';

/**
 * SporadicWorkflow Component (Day 4 - Module M5)
 * 
 * Main workflow component for sporadic cancer analysis.
 * Combines Banner + Quick Intake + Upload in a unified experience.
 * 
 * Critical for Ayesha: One place to manage germline-negative workflow.
 */
export default function SporadicWorkflow({ 
  patientId = "unknown",
  germlineStatus = "unknown", // "positive", "negative", "unknown"
  onTumorContextGenerated,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [tumorContext, setTumorContext] = useState(null);
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null); // Clear errors on tab change
  };

  const handleContextGenerated = (data) => {
    setTumorContext(data.tumor_context);
    setError(null);
    onTumorContextGenerated?.(data);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <Box>
      {/* Germline Status Banner */}
      <GermlineStatusBanner 
        germlineStatus={germlineStatus}
        onQuickIntake={() => setActiveTab(0)}
      />

      {/* RUO Disclaimer */}
      <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Research Use Only (RUO):</strong> This tool provides research-grade tumor analysis 
          for sporadic (non-hereditary) cancer cases. Results should be reviewed by qualified healthcare professionals.
        </Typography>
      </Alert>

      {/* Tab Navigation */}
      <Paper sx={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: '1px solid #333' }}
          indicatorColor="primary"
        >
          <Tab 
            label="Quick Intake" 
            icon={<Typography variant="caption">Level 0/1</Typography>}
            iconPosition="end"
          />
          <Tab 
            label="Upload NGS Report" 
            icon={<Typography variant="caption">Level 2</Typography>}
            iconPosition="end"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Tab Content */}
          {activeTab === 0 && (
            <TumorQuickIntake
              patientId={patientId}
              onContextGenerated={handleContextGenerated}
              onError={handleError}
            />
          )}

          {activeTab === 1 && (
            <TumorNGSUpload
              patientId={patientId}
              onContextGenerated={handleContextGenerated}
              onError={handleError}
            />
          )}
        </Box>
      </Paper>

      {/* Tumor Context Status (when generated) */}
      {tumorContext && (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: '#1e1e1e', border: '1px solid #00bcd4' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#00bcd4' }}>
            ✅ Tumor Context Ready
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You can now run efficacy predictions with sporadic-aware scoring.
            PARP inhibitors, immunotherapy, and confidence will be adjusted based on your tumor biomarkers.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}



