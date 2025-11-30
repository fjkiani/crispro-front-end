import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  TextField,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  Science,
  PlayArrow,
  Refresh
} from '@mui/icons-material';
import { ClinicalDossierView } from '../components/ClinicalDossier';

/**
 * Clinical Dossier Test Page
 * 
 * Test page for the MBD4+TP53 Clinical Dossier components
 * Uses the MBD4+TP53 test case from the development plan
 */
const ClinicalDossierTest = () => {
  // MBD4+TP53 test case mutations
  const [mutations, setMutations] = useState([
    {
      gene: 'MBD4',
      hgvs_p: 'p.Ile413Serfs*2',
      chrom: '3',
      pos: 129430456,
      ref: 'A',
      alt: '',
      build: 'GRCh37'
    },
    {
      gene: 'TP53',
      hgvs_p: 'p.Arg175His',
      chrom: '17',
      pos: 7577120,
      ref: 'G',
      alt: 'A',
      build: 'GRCh37'
    }
  ]);

  const [disease, setDisease] = useState('ovarian_cancer');
  const [tumorContext, setTumorContext] = useState({
    disease: 'ovarian_cancer',
    tmb: 25.0,
    msi_status: 'MSS'
  });
  const [patientId, setPatientId] = useState('MBD4_TP53_TEST_001');
  const [patientName, setPatientName] = useState('Test Patient (MBD4+TP53)');

  const handleExport = (format, dossierData) => {
    console.log(`Export requested: ${format}`, dossierData);
    if (format === 'pdf') {
      alert('PDF export will be implemented in Sprint 4');
    } else if (format === 'json') {
      const dataStr = JSON.stringify(dossierData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clinical_dossier_${dossierData?.report_id || 'export'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'share') {
      alert('Share functionality will be implemented in Sprint 4');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Test Page Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Clinical Dossier Test Page
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Testing MBD4+TP53 Clinical Dossier Components (Sprint 1)
              </Typography>
            </Box>
            <Chip
              icon={<Science />}
              label="Sprint 1: Foundation"
              color="primary"
              variant="outlined"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Test Case Info */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Test Mutations:
              </Typography>
              <Box sx={{ pl: 2 }}>
                {mutations.map((mut, idx) => (
                  <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{mut.gene}</strong>: {mut.hgvs_p}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Disease Context:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">
                  <strong>Disease:</strong> {disease}
                </Typography>
                <Typography variant="body2">
                  <strong>TMB:</strong> {tumorContext.tmb} mut/Mb
                </Typography>
                <Typography variant="body2">
                  <strong>MSI Status:</strong> {tumorContext.msi_status}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Test Instructions:</strong> This page tests the Clinical Dossier components with the MBD4+TP53 test case.
              The components will automatically fetch data from <code>/api/efficacy/predict</code> when mutations and disease are provided.
            </Typography>
          </Alert>
        </Paper>

        {/* Clinical Dossier View */}
        <ClinicalDossierView
          mutations={mutations}
          disease={disease}
          tumorContext={tumorContext}
          onExport={handleExport}
          patientId={patientId}
          patientName={patientName}
        />

        {/* Debug Info */}
        <Paper elevation={1} sx={{ p: 2, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            Debug Information:
          </Typography>
          <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
            {JSON.stringify({ mutations, disease, tumorContext }, null, 2)}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ClinicalDossierTest;


