import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const EmailGenerator = ({ intelligenceProfile, onEmailGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);

  const handleGenerate = async () => {
    if (!intelligenceProfile) {
      setError('Intelligence profile is required');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setEmail(null);

    try {
      const response = await fetch(`${API_ROOT}/api/personalized-outreach/generate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intelligence_profile: intelligenceProfile }),
      });

      if (!response.ok) {
        throw new Error(`Email generation failed: ${response.status}`);
      }

      const data = await response.json();
      setEmail(data);
      if (onEmailGenerated) {
        onEmailGenerated(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (email?.body) {
      navigator.clipboard.writeText(email.body);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EmailIcon color="primary" />
          <Typography variant="h6">Generate Personalized Email</Typography>
        </Box>

        {!intelligenceProfile && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Extract intelligence first to generate a personalized email.
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={isGenerating || !intelligenceProfile}
          fullWidth
          sx={{ mb: 2 }}
        >
          {isGenerating ? <CircularProgress size={20} /> : 'Generate Email'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {email && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Generated Email</Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
              >
                Copy
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Subject:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {email.subject}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Body:</Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={email.body}
                InputProps={{ readOnly: true }}
                sx={{ mt: 1 }}
              />
            </Box>

            {email.personalization_quality && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`Personalization Quality: ${(email.personalization_quality * 100).toFixed(0)}%`}
                  color={email.personalization_quality >= 0.7 ? 'success' : 'warning'}
                />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailGenerator;
