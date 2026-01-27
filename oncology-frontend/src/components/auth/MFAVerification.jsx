/**
 * MFA Verification Component
 * 
 * Purpose: Verify MFA code for login or session verification.
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const MFAVerification = ({ onSuccess, onCancel, title = "Verify MFA Code" }) => {
  const { token } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid MFA code');
      }

      if (data.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.message || 'Failed to verify MFA code');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the 6-digit code from your authenticator app.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          label="MFA Code"
          value={code}
          onChange={handleCodeChange}
          onKeyPress={handleKeyPress}
          placeholder="000000"
          inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
          fullWidth
          sx={{ mb: 2 }}
          autoFocus
        />

        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify'}
        </Button>

        {onCancel && (
          <Button
            variant="text"
            onClick={onCancel}
            fullWidth
          >
            Cancel
          </Button>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Don't have access to your authenticator app? Use a backup code instead.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MFAVerification;
