/**
 * Patient Settings Page - SaaS account management for patient users
 * 
 * Features:
 * - MFA enrollment/verification
 * - DSR (Data Subject Request) management
 * - Quota display and usage
 * - Account settings (tier, profile)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper
} from '@mui/material';
import {
  Security as SecurityIcon,
  PrivacyTip as PrivacyIcon,
  AccountCircle as AccountIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import QuotaDisplay from '../components/patient/QuotaDisplay';
import MFASetup from '../components/auth/MFASetup';
import MFAVerify from '../components/auth/MFAVerify';
import DSRRequestForm from '../components/auth/DSRRequestForm';

const PatientSettings = () => {
  const { user, isAuthenticated, isSupabaseEnabled } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [dsrRequests, setDsrRequests] = useState([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isSupabaseEnabled) {
      setError("Supabase not configured - settings unavailable");
      setLoading(false);
      return;
    }
    
    loadSettings();
  }, [isAuthenticated, isSupabaseEnabled, navigate]);
  
  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load quota
      const quotaRes = await fetch('/api/patient/quota', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      
      if (quotaRes.ok) {
        const quotaData = await quotaRes.json();
        setQuota(quotaData);
      }
      
      // Load MFA status
      const profileRes = await fetch('/api/patient/profile', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setMfaEnabled(profile.mfa_enabled || false);
      }
      
      // Load DSR requests
      const dsrRes = await fetch('/api/auth/dsr', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      
      if (dsrRes.ok) {
        const dsrData = await dsrRes.json();
        setDsrRequests(dsrData.requests || []);
      }
      
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your account security, privacy, and usage limits
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Quota Display */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Usage & Quotas</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {quota ? (
                <QuotaDisplay quota={quota} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loading quota information...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* MFA Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Multi-Factor Authentication</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mfaEnabled}
                      disabled
                      readOnly
                    />
                  }
                  label={mfaEnabled ? "MFA Enabled" : "MFA Disabled"}
                />
                {mfaEnabled ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Protected"
                    color="success"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                ) : (
                  <Chip
                    icon={<CancelIcon />}
                    label="Not Protected"
                    color="warning"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
              
              {!mfaEnabled ? (
                <MFASetup onEnrolled={loadSettings} />
              ) : (
                <MFAVerify onVerified={loadSettings} />
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* DSR Requests */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PrivacyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Data Subject Requests (GDPR)</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Request access to your data, data deletion, or data portability
              </Typography>
              
              <DSRRequestForm onSubmitted={loadSettings} />
              
              {dsrRequests.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Requests
                  </Typography>
                  <List>
                    {dsrRequests.map((request) => (
                      <ListItem key={request.id}>
                        <ListItemIcon>
                          {request.status === 'completed' ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <CircularProgress size={20} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={request.request_type}
                          secondary={`Status: ${request.status} - Created: ${new Date(request.created_at).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Account Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Account Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Tier"
                    value={quota?.tier || 'free'}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              
              <Box mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/patient/profile')}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientSettings;
