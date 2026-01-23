/**
 * MFA Enrollment Component
 * 
 * Purpose: Allow users to enroll in Multi-Factor Authentication (MFA).
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
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const MFAEnrollment = ({ onComplete, onCancel }) => {
  const { user, token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');

  const steps = ['Generate Secret', 'Verify Code', 'Complete'];

  const handleGenerateSecret = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/mfa/generate-secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate MFA secret');
      }

      if (data.success && data.data) {
        setQrCodeUrl(data.data.qr_code_url);
        setSecret(data.data.secret);
        setBackupCodes(data.data.backup_codes || []);
        setActiveStep(1);
        setSuccess('MFA secret generated. Please scan the QR code with your authenticator app.');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate MFA secret');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnrollment = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/mfa/verify-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to verify MFA code');
      }

      if (data.success) {
        setActiveStep(2);
        setSuccess('MFA enabled successfully!');
        
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to enable MFA');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setError(null);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Enable Multi-Factor Authentication (MFA)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add an extra layer of security to your account by enabling MFA.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Click the button below to generate a QR code for your authenticator app.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateSecret}
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate MFA Secret'}
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            {qrCodeUrl && (
              <Paper sx={{ p: 2, mb: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <img
                    src={qrCodeUrl}
                    alt="MFA QR Code"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
                {secret && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Or enter this secret manually: <code>{secret}</code>
                  </Typography>
                )}
              </Paper>
            )}

            {backupCodes.length > 0 && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  ⚠️ Save these backup codes in a safe place:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {backupCodes.map((code,ex) => (
                    <Typography key={index} variant="body2" component="code" sx={{ fontFamily: 'monospace' }}>
                      {code}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  You can use these codes to access your account if you lose your authenticator device.
                </Typography>
              </Paper>
            )}

            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter the 6-digit code from your authenticator app:
            </Typography>
            <TextField
              label="MFA Code"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="000000"
              inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleVerifyEnrollment}
                disabled={loading || verificationCode.length !== 6}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Verify & Enable MFA'}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
              ✓ MFA Enabled Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your account is now protected with multi-factor authentication.
            </Typography>
            <Button
              variant="contained"
              onClick={onComplete}
              fulidth
            >
              Done
            </Button>
          </Box>
        )}

        {onCancel && activeStep < 2 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="text"
              onClick={onCancel}
              fullWidth
            >
              Cancel
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MFAEnrollment;
