/**
 * PatientUpload Component
 * 
 * Modular component for uploading patient files (NGS PDF, VCF, MAF, etc.)
 * and initiating pipeline execution.
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';
import { useOrchestrator } from '../../../hooks/useOrchestrator';

const FILE_TYPES = {
  pdf: 'PDF Report',
  vcf: 'VCF File',
  maf: 'MAF File',
  json: 'JSON File',
  txt: 'Text File',
};

export const PatientUpload = ({ onUploadComplete, patientId }) => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const { runPipeline, loading, error } = useOrchestrator();

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-detect file type from extension
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      setFileType(extension);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    try {
      await runPipeline(
        {
          patient_id: patientId,
          options: {},
        },
        file,
        fileType
      );
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Patient Data
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload NGS report (PDF), VCF, MAF, or other genomic data files
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <input
            accept=".pdf,.vcf,.maf,.json,.txt"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              disabled={loading}
              fullWidth
            >
              Select File
            </Button>
          </label>
        </Box>

        {file && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description />
              <Typography variant="body2">
                {file.name} ({FILE_TYPES[fileType] || fileType.toUpperCase()})
              </Typography>
            </Box>
          </Box>
        )}

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Processing file...
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
          fullWidth
        >
          {loading ? 'Processing...' : 'Start Analysis'}
        </Button>
      </CardContent>
    </Card>
  );
};


