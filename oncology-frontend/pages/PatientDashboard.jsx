/**
 * Patient Dashboard - Unified dashboard for patient users
 * 
 * Shows all patient-relevant information:
 * - Profile summary
 * - Active care plan
 * - Clinical trial matches
 * - Recent activity
 * - Quick actions
 * - SaaS account info (quota, tier, features)
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
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as CarePlanIcon,
  Science as TrialIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { PatientUpload } from '../components/orchestrator/Patient/PatientUpload';
import PatientDashboardInsights from '../components/patient/PatientDashboardInsights';
import PatientJourneyEnhanced from '../components/patient/PatientJourneyEnhanced';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

export default function PatientDashboard() {
  const { user, profile: authProfile, session } = useAuth();
  const { patientProfile, currentSession, carePlan, loading: patientLoading, loadPatientContext } = usePatient();
  const navigate = useNavigate();

  // State
  const [quota, setQuota] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    if (user && session?.access_token) {
      loadDashboardData();
    }
  }, [user, session]);

  const loadDashboardData = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      // Load quota
      const quotaRes = await fetch(`${API_ROOT}/api/patient/quota`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (quotaRes.ok) {
        const quotaData = await quotaRes.json();
        setQuota(quotaData);
      }

      // Load activity
      const activityRes = await fetch(`${API_ROOT}/api/patient/activity?limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivity(activityData.activity || []);
      }

      // Reload patient context
      if (loadPatientContext) {
        await loadPatientContext();
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (!patientLoading && !patientProfile && user) {
      navigate('/patient/onboarding');
    }
  }, [patientLoading, patientProfile, user, navigate]);

  if (loading || patientLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!patientProfile) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Patient profile not found. Please complete onboarding.
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/patient/onboarding')}
        >
          Go to Onboarding
        </Button>
      </Box>
    );
  }

  // Handlers for PatientDashboardInsights
  const handleViewCarePlan = () => {
    navigate('/ayesha-complete-care');
  };

  const handleViewTrials = () => {
    navigate('/ayesha-trials');
  };

  const handleUploadTest = (testName) => {
    // Navigate to profile page for test upload
    navigate('/patient/profile', { state: { uploadTest: testName } });
  };

  // Count trials from patient profile (if available)
  const trialCount = patientProfile?.clinical_trial_matches?.length || 0;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Patient Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {patientProfile.full_name || authProfile?.full_name || user?.email}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Profile & Quick Actions */}
        <Grid item xs={12} md={4}>
          {/* Patient Dashboard Insights */}
          <PatientDashboardInsights
            patientProfile={patientProfile}
            carePlan={carePlan}
            trialCount={trialCount}
            onViewCarePlan={handleViewCarePlan}
            onViewTrials={handleViewTrials}
            onUploadTest={handleUploadTest}
          />

          {/* Quick Actions Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">Quick Actions</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<UploadIcon />}
                  onClick={() => navigate('/patient/profile')}
                >
                  Upload NGS Report
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/patient/profile')}
                >
                  Update CA-125
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CarePlanIcon />}
                  onClick={() => navigate('/ayesha-complete-care')}
                >
                  Generate Care Plan
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrialIcon />}
                  onClick={() => navigate('/ayesha-trials')}
                >
                  View Clinical Trials
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* SaaS Account Card */}
          {quota && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6">Account</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Tier
                  </Typography>
                  <Chip
                    label={quota.tier?.toUpperCase() || 'FREE'}
                    color={quota.tier === 'enterprise' ? 'success' : quota.tier === 'pro' ? 'primary' : 'default'}
                    sx={{ mb: 2 }}
                  />
                </Box>

                {/* Quota Usage */}
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Variant Analyses
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={
                        quota.variant_analyses?.limit === -1
                          ? 0
                          : (quota.variant_analyses?.used / quota.variant_analyses?.limit) * 100
                      }
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="caption">
                      {quota.variant_analyses?.used || 0} /{' '}
                      {quota.variant_analyses?.limit === -1
                        ? '∞'
                        : quota.variant_analyses?.limit || 0}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Drug Queries
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={
                        quota.drug_queries?.limit === -1
                          ? 0
                          : (quota.drug_queries?.used / quota.drug_queries?.limit) * 100
                      }
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="caption">
                      {quota.drug_queries?.used || 0} /{' '}
                      {quota.drug_queries?.limit === -1 ? '∞' : quota.drug_queries?.limit || 0}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/patient/settings')}
                  sx={{ mt: 2 }}
                >
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column: Care Plans, Trials, Activity */}
        <Grid item xs={12} md={8}>
          {/* Active Care Plan Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CarePlanIcon color="primary" />
                  <Typography variant="h6">Active Care Plan</Typography>
                </Box>
                {carePlan && (
                  <Chip
                    label="Active"
                    color="success"
                    size="small"
                  />
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {carePlan ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Generated
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {carePlan.created_at
                      ? new Date(carePlan.created_at).toLocaleString()
                      : 'Recently'}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CarePlanIcon />}
                    onClick={() => navigate('/ayesha-complete-care')}
                  >
                    View Full Care Plan
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No active care plan. Generate one to get started.
                  </Alert>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CarePlanIcon />}
                    onClick={() => navigate('/ayesha-complete-care')}
                  >
                    Generate Care Plan
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Clinical Trial Matches Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrialIcon color="primary" />
                  <Typography variant="h6">Clinical Trial Matches</Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/ayesha-trials')}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Alert severity="info">
                View your personalized clinical trial matches on the Trials page.
              </Alert>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrialIcon />}
                onClick={() => navigate('/ayesha-trials')}
                sx={{ mt: 2 }}
              >
                Explore Clinical Trials
              </Button>
            </CardContent>
          </Card>

          {/* Patient Journey Timeline */}
          <PatientJourneyEnhanced patientProfile={patientProfile} />

          {/* Recent Activity Card */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6">Recent Activity</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {activity.length > 0 ? (
                <List>
                  {activity.map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        {item.type === 'care_plan' && <CarePlanIcon />}
                        {item.type === 'session' && <HistoryIcon />}
                        {item.type === 'profile_update' && <PersonIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          item.timestamp
                            ? new Date(item.timestamp).toLocaleString()
                            : 'Recently'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No recent activity. Start by generating a care plan or uploading an NGS report.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
