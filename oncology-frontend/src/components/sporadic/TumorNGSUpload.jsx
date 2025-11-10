import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const API_ROOT = import.meta.env.VITE_API_ROOT || '';

/**
 * TumorNGSUpload Component (Day 4 - Module M5)
 * 
 * Upload component for tumor NGS reports (Foundation Medicine, Tempus).
 * Generates Level 2 TumorContext by parsing PDF/JSON reports.
 * 
 * NOTE: PDF parsing is STUBBED for Phase 1 (security/complexity).
 * Currently accepts JSON only, shows "Coming Soon" for PDF.
 * 
 * Calls: POST /api/tumor/ingest_ngs
 */
export default function TumorNGSUpload({ 
  patientId = "unknown", 
  onContextGenerated,
  onError 
}) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    
    // Only accept JSON for Phase 1
    if (fileType !== 'json') {
      onError?.("PDF parsing is coming soon. Please upload JSON format or use Quick Intake.");
      event.target.value = ''; // Reset input
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError?.("Please select a file");
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // Read file as text (JSON only for now)
      const fileText = await selectedFile.text();
      const reportJson = JSON.parse(fileText);

      // Call ingest endpoint
      const payload = {
        patient_id: patientId,
        report_provider: "foundation_medicine", // Default
        report_json: reportJson, // Direct JSON (bypass PDF parsing)
      };

      const response = await fetch(`${API_ROOT}/api/tumor/ingest_ngs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'NGS ingestion failed');
      }

      const data = await response.json();
      setResult(data);
      onContextGenerated?.(data);

    } catch (err) {
      console.error('Upload error:', err);
      onError?.(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card sx={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
      <CardHeader
        avatar={<DescriptionIcon sx={{ color: '#9c27b0' }} />}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Upload Tumor NGS Report</Typography>
            <Chip label="Level 2 - Highest Accuracy" size="small" color="secondary" />
          </Stack>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Foundation Medicine, Tempus, or similar comprehensive genomic profiling
          </Typography>
        }
      />

      <Divider />

      <CardContent>
        {/* Warning Alert for PDF */}
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Phase 1 Limitation:</strong> PDF parsing is <strong>coming soon</strong> (security review in progress).
            <br />
            Currently accepting <strong>JSON format only</strong>. Use Quick Intake for immediate analysis.
          </Typography>
        </Alert>

        {/* Upload Area */}
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed #666',
            backgroundColor: '#252525',
            cursor: selectedFile ? 'default' : 'pointer',
            '&:hover': {
              borderColor: selectedFile ? '#666' : '#9c27b0',
            },
          }}
          onClick={() => !selectedFile && document.getElementById('ngs-file-input').click()}
        >
          <input
            id="ngs-file-input"
            type="file"
            accept=".json,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {!selectedFile ? (
            <>
              <CloudUploadIcon sx={{ fontSize: 60, color: '#9c27b0', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Drop NGS Report or Click to Browse
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported: Foundation Medicine, Tempus (JSON only for Phase 1)
              </Typography>
            </>
          ) : (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#00bcd4', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    document.getElementById('ngs-file-input').value = '';
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </>
          )}
        </Paper>

        {/* Upload Button */}
        {selectedFile && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            sx={{
              mt: 3,
              background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)',
              }
            }}
          >
            {uploading ? 'Processing Report...' : 'Upload & Parse Report'}
          </Button>
        )}

        {/* Progress Bar (only when uploading) */}
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Parsing NGS report and extracting tumor biomarkers...
            </Typography>
          </Box>
        )}

        {/* Result Display */}
        {result && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#252525', borderRadius: 1, border: '1px solid #00bcd4' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <CheckCircleOutlineIcon sx={{ color: '#00bcd4' }} />
              <Typography variant="h6">Report Parsed Successfully</Typography>
              <Chip label="Level 2" size="small" color="success" />
            </Stack>

            {/* TODO: Display parsed tumor context details */}
            <Typography variant="body2" color="text.secondary">
              Tumor context parsed. Ready for efficacy prediction with highest confidence.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

