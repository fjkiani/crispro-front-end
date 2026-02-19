/**
 * PatientProfileSummary - Displays patient profile information card
 * 
 * Shows disease, germline status, and key biomarkers in a clean card layout.
 */

import React from 'react';
import { Card, Typography, Grid, Alert, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ProfileEditModal from './modals/ProfileEditModal';
import { useProfileEditor } from '../../hooks/ayesha/useProfileEditor';

export default function PatientProfileSummary({ patientProfile }) {
  const editor = useProfileEditor(patientProfile);

  if (!patientProfile) return null;

  return (
    <>
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.50', position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Patient Profile: {patientProfile.patient?.display_name || 'AK'}
          </Typography>
          <IconButton
            size="small"
            onClick={editor.openEditor}
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Disease</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {patientProfile.disease?.histology || 'High-grade serous carcinoma'} - Stage {editor.editState.stage}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Context</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Line {editor.editState.line_of_therapy} | PFI: {editor.editState.pfi_months}m
            </Typography>
            <Typography variant="caption" sx={{
              color: editor.editState.pfi_status === 'Platinum Refractory' ? 'error.main' :
                editor.editState.pfi_status === 'Platinum Resistant' ? 'warning.main' : 'success.main',
              fontWeight: 'bold'
            }}>
              {editor.editState.pfi_status}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Germline Status</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color: patientProfile.germline_status === 'positive' ? 'warning.main' : 'text.primary' }}>
              {patientProfile.germline_status?.toUpperCase() || 'UNKNOWN'}
              {patientProfile.germline?.mutations?.[0]?.gene && ` (${patientProfile.germline.mutations[0].gene})`}
            </Typography>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          Using <strong>AYESHA_11_17_25_PROFILE</strong> - source of truth from 7 parsed medical reports.
        </Alert>
      </Card>

      {/* Editor Modal */}
      <ProfileEditModal
        isOpen={editor.isModalOpen}
        onClose={editor.closeEditor}
        editor={editor}
      />
    </>
  );
}

