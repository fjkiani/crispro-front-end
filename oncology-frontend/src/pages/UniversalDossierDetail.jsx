/**
 * Universal Dossier Detail Page
 * 
 * Displays full dossier markdown for any patient.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon, Email as EmailIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const UniversalDossierDetail = () => {
  const { patientId, nct_id } = useParams();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientId && nct_id) {
      loadDossier();
    }
  }, [patientId, nct_id]);

  const loadDossier = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROOT}/api/dossiers/intelligence/${patientId}/${nct_id}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDossier(data);

    } catch (err) {
      setError(err.message);
      console.error('Failed to load dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!dossier) return;

    const blob = new Blob([dossier.markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nct_id}_DOSSIER.md`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading dossier...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Dossier</Typography>
          <Typography variant="body2">{error}</Typography>
          <Button onClick={loadDossier} sx={{ mt: 2 }} variant="outlined">
            Retry
          </Button>
          <Button onClick={() => navigate(-1)} sx={{ mt: 2, ml: 2 }} variant="outlined">
            Go Back
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!dossier) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Dossier not found for patient {patientId} and trial {nct_id}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 1 }}
          >
            Back to Dossiers
          </Button>
          <Typography variant="h4" gutterBottom>
            Trial Intelligence Report: {nct_id}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
            <Chip label={`Patient: ${patientId}`} color="primary" />
            {dossier.metadata?.tier && (
              <Chip
                label={dossier.metadata.tier}
                color={dossier.metadata.tier === 'TOP_TIER' ? 'success' : 'info'}
              />
            )}
            {dossier.metadata?.match_score && (
              <Chip
                label={`Match: ${Math.round(dossier.metadata.match_score * 100)}%`}
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EmailIcon />}
            onClick={() => {
              const subject = encodeURIComponent(`Review: Therapy Fit Dossier for ${patientId} (${nct_id})`);
              const body = encodeURIComponent(`Review Attached Dossier.\n\nSummary:\n${dossier.metadata?.tier || 'N/A'} Match\nScore: ${Math.round(dossier.metadata?.match_score * 100)}%\n\nView Full Report: ${window.location.href}`);
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
          >
            Email Doctor
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export Markdown
          </Button>
        </Box>
      </Box>

      {/* Dossier Content */}
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            '& h1': { mt: 3, mb: 2 },
            '& h2': { mt: 2, mb: 1 },
            '& h3': { mt: 2, mb: 1 },
            '& p': { mb: 1 },
            '& ul, & ol': { mb: 2 },
            '& table': { width: '100%', borderCollapse: 'collapse', mb: 2 },
            '& th, & td': { border: '1px solid #ddd', padding: '8px', textAlign: 'left' },
            '& th': { backgroundColor: '#f5f5f5', fontWeight: 'bold' },
            '& code': { backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' },
            '& pre': { backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' },
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {dossier.markdown}
          </ReactMarkdown>
        </Box>
      </Paper>
    </Box>
  );
};

export default UniversalDossierDetail;

