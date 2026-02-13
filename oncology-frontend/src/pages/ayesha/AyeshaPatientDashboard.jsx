/**
 * Ayesha Patient Dashboard - Beautiful, Modular Landing Page
 * 
 * When Ayesha logs in, this is her main dashboard showing:
 * - Patient Journey Timeline (diagnosis → tests → treatments)
 * - Quick Profile Summary (biomarkers, stage, status)
 * - Quick Actions (navigate to trials, treatment, monitoring)
 * - Key Insights (DDR Status, SOC, Next Steps) - collapsible cards
 * - Personalized Recommendations (Drug + Food) [NEW]
 * 
 * NO NESTED TABS - All navigation via sidebar
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Collapse,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Science as ScienceIcon,
  LocalHospital as LocalHospitalIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import hooks (single source of truth)
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaCareData } from '../../hooks/ayesha/useAyeshaCareData';

// Import existing components
import PatientJourneyEnhanced from '../../components/patient/PatientJourneyEnhanced';
import CA125Tracker from '../../components/ayesha/CA125Tracker';
import SOCRecommendationCard from '../../components/ayesha/SOCRecommendationCard';
import NextTestCard from '../../components/ayesha/NextTestCard';
import { DDRStatusCard } from '../../components/ddr';
import { useDDRStatus } from '../../hooks/useDDRStatus';
import {
  FoodRecommendationsCard,
  DrugRecommendationsCard
} from '../../components/ayesha/twin';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

// Styled components for beautiful UI
const DashboardHeader = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 40, 80, 0.95) 100%)',
  color: '#ffffff',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  border: '2px solid rgba(0, 255, 127, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 255, 127, 0.2)',
}));

const InsightCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  border: '1px solid rgba(0, 255, 127, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 255, 127, 0.15)',
    borderColor: 'rgba(0, 255, 127, 0.4)',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.1), rgba(0, 191, 255, 0.1))',
  border: '1px solid rgba(0, 255, 127, 0.3)',
  color: '#00ff7f',
  padding: theme.spacing(1.5, 3),
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.2), rgba(0, 191, 255, 0.2))',
    borderColor: 'rgba(0, 255, 127, 0.5)',
    transform: 'translateY(-2px)',
  },
}));

const AyeshaPatientDashboard = () => {
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState({
    ddr: false,
    soc: false,
    nextSteps: false,
    ca125: false,
  });

  // Use hooks - single source of truth
  const { profile, patient, disease, tumorContext, germline, labs, biomarkerChips, getDDRMutations } = useAyeshaProfile();
  const { result: careData, loading, error } = useAyeshaCareData({
    include_trials: false,
    include_wiwfm: true, // Enabled for dashboard
    include_food: true,   // Enabled for dashboard
    include_resistance: false,
    include_soc: true,
    include_ca125: true,
    include_biomarker: true,
  });

  // DDR Status
  const { ddrStatus, loading: ddrLoading, calculateDDRStatus } = useDDRStatus();
  const ddrCalculationInitiated = React.useRef(false);

  // Toggle card expansion
  const handleToggleCard = (cardName) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }));
  };

  // DDR Status calculation (only once)
  useEffect(() => {
    if (ddrStatus || ddrLoading || ddrCalculationInitiated.current) return;

    const mutations = getDDRMutations();

    if (mutations.length > 0) {
      ddrCalculationInitiated.current = true;
      calculateDDRStatus({
        patient_id: patient?.patient_id || 'AK',
        disease_site: 'ovary',
        tumor_subtype: 'HGSOC',
        mutations,
      }).catch((err) => {
        console.error('[DDR] Failed to compute:', err);
        ddrCalculationInitiated.current = false;
      });
    }
  }, [getDDRMutations, patient, calculateDDRStatus, ddrStatus, ddrLoading]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load dashboard: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Beautiful Header */}
      <DashboardHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ScienceIcon sx={{ fontSize: 48, color: '#00ff7f', filter: 'drop-shadow(0 0 10px rgba(0, 255, 127, 0.8))' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
              Welcome back, {patient?.display_name || 'Ayesha'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Your personalized precision oncology dashboard
            </Typography>
          </Box>
        </Box>

        {/* Biomarker Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {biomarkerChips.map((chip, idx) => (
            <Chip
              key={idx}
              label={chip.label}
              color={chip.color}
              size="small"
              sx={{
                background: chip.color === 'error' ? 'rgba(211, 47, 47, 0.2)' : 'rgba(0, 255, 127, 0.1)',
                border: `1px solid ${chip.color === 'error' ? 'rgba(211, 47, 47, 0.5)' : 'rgba(0, 255, 127, 0.3)'}`,
                color: '#ffffff',
              }}
            />
          ))}
        </Box>
      </DashboardHeader>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon sx={{ color: '#00ff7f' }} />
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              startIcon={<ScienceIcon />}
              onClick={() => navigate('/ayesha-trials/explore')}
            >
              Clinical Trials
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              startIcon={<LocalHospitalIcon />}
              onClick={() => navigate('/ayesha-complete-care')}
            >
              Complete Care Plan
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              startIcon={<VisibilityIcon />}
              onClick={() => navigate('/ayesha-dossiers')}
            >
              Trial Dossiers
            </QuickActionButton>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionButton
              fullWidth
              startIcon={<TimelineIcon />}
              onClick={() => {
                // Scroll to timeline section
                document.getElementById('patient-journey')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Journey
            </QuickActionButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Insights - Collapsible Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* DDR Status Card */}
        <Grid item xs={12} md={6}>
          <InsightCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🧬 DDR Status & PARP Eligibility
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleToggleCard('ddr')}
                  sx={{ color: '#00ff7f' }}
                >
                  {expandedCards.ddr ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              {ddrLoading ? (
                <Box display="flex" alignItems="center" gap={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Computing DDR status...</Typography>
                </Box>
              ) : ddrStatus ? (
                <>
                  <DDRStatusCard ddrStatus={ddrStatus} />
                  <Collapse in={expandedCards.ddr}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        DDR (DNA Damage Response) status determines PARP inhibitor eligibility.
                        High DDR burden indicates synthetic lethality opportunities.
                      </Typography>
                    </Box>
                  </Collapse>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  DDR status requires genomic mutation data. MBD4 frameshift detected — computing status…
                </Alert>
              )}
            </CardContent>
          </InsightCard>
        </Grid>

        {/* SOC Recommendation Card */}
        {careData?.soc_recommendation && (
          <Grid item xs={12} md={6}>
            <InsightCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    💊 Standard of Care
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleCard('soc')}
                    sx={{ color: '#00ff7f' }}
                  >
                    {expandedCards.soc ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Collapse in={expandedCards.soc || true}>
                  <SOCRecommendationCard {...careData.soc_recommendation} />
                </Collapse>
              </CardContent>
            </InsightCard>
          </Grid>
        )}

        {/* Next Steps Card */}
        {careData?.next_test_recommender && (
          <Grid item xs={12} md={6}>
            <InsightCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Recommended Next Steps
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleCard('nextSteps')}
                    sx={{ color: '#00ff7f' }}
                  >
                    {expandedCards.nextSteps ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Collapse in={expandedCards.nextSteps || true}>
                  <NextTestCard recommendations={careData.next_test_recommender?.recommendations || []} />
                </Collapse>
              </CardContent>
            </InsightCard>
          </Grid>
        )}

        {/* CA-125 Monitoring Card */}
        {careData?.ca125_intelligence && (
          <Grid item xs={12} md={6}>
            <InsightCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📊 CA-125 Monitoring
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleCard('ca125')}
                    sx={{ color: '#00ff7f' }}
                  >
                    {expandedCards.ca125 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Collapse in={expandedCards.ca125 || true}>
                  <CA125Tracker {...careData.ca125_intelligence} />
                </Collapse>
              </CardContent>
            </InsightCard>
          </Grid>
        )}

        {/* Drug Recommendations (Personalized) */}
        {careData?.wiwfm?.drugs && (
          <Grid item xs={12} md={6}>
            <DrugRecommendationsCard drugRecommendations={careData.wiwfm.drugs} />
          </Grid>
        )}

        {/* Food Recommendations (Symptom Mgmt) */}
        {careData?.food_recommendations && (
          <Grid item xs={12} md={6}>
            <FoodRecommendationsCard
              foodRecommendations={careData.food_recommendations}
              analysisSummary={careData.summary || {}}
            />
          </Grid>
        )}
      </Grid>

      {/* Patient Journey Timeline - Main Feature */}
      <Paper
        id="patient-journey"
        sx={{
          p: 4,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.02), rgba(0, 40, 80, 0.02))',
          border: '1px solid rgba(0, 255, 127, 0.1)',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon sx={{ color: '#00ff7f' }} />
          Your Journey
        </Typography>
        <PatientJourneyEnhanced patientProfile={profile} />
      </Paper>

      {/* RUO Disclaimer */}
      <Alert severity="info" sx={{ mt: 4, borderRadius: '8px' }}>
        <Typography variant="body2">
          <strong>Research Use Only (RUO):</strong> This tool is for research purposes only. All recommendations
          should be reviewed by a qualified oncologist before making treatment decisions.
        </Typography>
      </Alert>
    </Container>
  );
};

export default AyeshaPatientDashboard;
